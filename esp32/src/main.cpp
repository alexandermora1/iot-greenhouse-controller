#include <Arduino.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include <Wire.h>
#include <SPI.h>
#include "Adafruit_SHT31.h"
#include "Adafruit_LTR329_LTR303.h"
#include "credentials.h"


// Token generation process info
FirebaseData fbdata;
FirebaseAuth auth;
FirebaseConfig config;
FirebaseJson json;


// NTP settings
const char* ntpServer = "no.pool.ntp.org"; // Norwegian NTP server
const long  gmtOffset_sec = 0;          // adjust for your time zone (e.g., 3600 for GMT+1)
const int   daylightOffset_sec = 0;     // adjust if you observe daylight savings


// SHT31 temperature and humidity sensor
Adafruit_SHT31 sht31 = Adafruit_SHT31();

// LTR-329 light sensor
Adafruit_LTR329 ltr = Adafruit_LTR329();

// Track last time we read sensors (or push data)
unsigned long lastReading = 0;
const unsigned long READING_INTERVAL = 900000; // 15 minutes

void setup() {
  Serial.begin(115200);
  while (!Serial) {delay(10);}

  // Initialize SHT31
  Serial.println("Initializing SHT31...");
  if (!sht31.begin(0x44)) { // Use 0x45 if your sensor has that I2C address
    Serial.println("Couldn't find SHT31 sensor!");
    while (1) { delay(1); }
  }

  // Initialize LTR-329
  Serial.println("Initializing LTR-329...");
  if (!ltr.begin()) {
    Serial.println("Couldn't find LTR-329 sensor!");
    while (1) { delay(10); }
  }
  Serial.println("Found LTR-329 sensor!");


  // Connect to wifi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("Connected to Wi-Fi");


  // Configure NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  // Wait for time to be set
  Serial.println("Waiting for NTP time sync...");
  while (time(nullptr) < 100000) { // Arbitrary check: time(nullptr) returns 0 or low value if time not set
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nTime synced!");


  // Configure and begin firebase
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_DB_URL;

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback;

  auth.user.email = FIREBASE_AUTH_EMAIL;     
  auth.user.password = FIREBASE_AUTH_PASSWORD; 

  /* Initialize the library with the Firebase authen and config */
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Wait for authentication to complete
  Serial.println("Waiting for Firebase authentication...");
  unsigned long authStart = millis();
  while (!Firebase.ready() && millis() - authStart < 30000) { // timeout after 30 seconds
    Serial.print(".");
    delay(1000);
  }

  if (!Firebase.ready()) {
    Serial.println("\nFirebase authentication failed! Restarting...");
    ESP.restart();
  }
  
  Serial.println("\nFirebase authenticated!");
}


void loop() {
  // Check Firebase connection before proceeding
  if (!Firebase.ready()) {
    Serial.println("Firebase not ready. Attempting to reconnect...");
    delay(1000);
    return;
  }

  // If 15 minutes have not yet passed, do nothing
  if (millis() - lastReading < READING_INTERVAL)
  {
    return;
  }
  lastReading = millis(); // reset the timer for the next reading

  // Get current epoch time
  time_t now = time(nullptr);
  Serial.printf("Epoch time: %ld\n", (long)now);

  // Read SHT31 and offset incorrect temperature value
  float measuredTemp = sht31.readTemperature();
  float calibrationOffset = -8.0; //Subtract 8 degrees
  float t = measuredTemp + calibrationOffset;
  float h = sht31.readHumidity();

  if (! isnan(t)) {  // check if 'is not a number'
    Serial.print("Temp *C = "); Serial.print(t); Serial.print("\t\t");
  } else { 
    Serial.println("Failed to read temperature");
  }
  
  if (! isnan(h)) {  // check if 'is not a number'
    Serial.print("Hum. % = "); Serial.println(h);
  } else { 
    Serial.println("Failed to read humidity");
  }


  // Read LTR-329
  uint16_t visible_plus_ir = 0;
  uint16_t infrared = 0;
  int visible_only = 0;

  if (ltr.newDataAvailable()) {
    bool validData = ltr.readBothChannels(visible_plus_ir, infrared);
    if (validData) {
      // Subtract IR from total to approximate visible light
      visible_only = (int)visible_plus_ir - (int)infrared;
      // Clamp to zero to avoid negative results if IR reading is higher
      if (visible_only < 0) visible_only = 0;

      Serial.print("LTR-329 CH0 (Vis+IR): ");
      Serial.print(visible_plus_ir);
      Serial.print("\tCH1 (IR): ");
      Serial.print(infrared);
      Serial.print("\tDerived Visible: ");
      Serial.println(visible_only);
    } else {
      Serial.println("Failed to read data from LTR-329");
    }
  } else {
    Serial.println("LTR-329 data not yet available...");
  }


  // Historical sensor values for the deatil views of the app
  // Builds a JSON object for the historical sensor readings
  // The path is "/greenhouse/sensor1/history"
  // Firebase will generate a unique key for each push so a time series can be retrieved on the frontend
  // ------------------------------------------------------------------
  bool dataSent = false;
  int retryCount = 0;
  const int maxRetries = 3;

  {
    json.clear();
    json.set("temperature", t);
    json.set("humidity", h);
    json.set("light", visible_only);
    json.set("timestamp", (long)now);

    String historyPath = "/greenhouseHistory";
    
    dataSent = false;
    retryCount = 0;

    while (!dataSent && retryCount < maxRetries) {
      if (Firebase.RTDB.pushJSON(&fbdata, historyPath, &json)) {
        Serial.println("Historical sensor data pushed to Firebase.");
        dataSent = true;
      } else {
        Serial.printf("Failed to push historical data (attempt %d/%d): %s\n", 
          retryCount + 1, maxRetries, fbdata.errorReason().c_str());
        retryCount++;
        delay(1000);
      }
    }
  }

}

