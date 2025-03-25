
 
#include <Arduino.h>
// #include <FirebaseJson.h>
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

void setup() {
  Serial.begin(115200);

  // Initialize Serial (for older boards that need the while)
  while (!Serial) {
    delay(10);
  }

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

  // TODO - Sign up or sign in
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase SignUp successful");
  } else {
    Serial.printf("SignUp Error: %s\n", config.signer.signupError.message.c_str());
  }

  // Initialize the library
  Firebase.begin(&config, &auth);
}


void loop() {
  // Get current epoch time
  time_t now = time(nullptr);
  Serial.print("Epoch time: ");
  Serial.println((long)now);


  // Read SHT31 and offset incorrect temperature value
  float measuredTemp = sht31.readTemperature();
  float calibrationOffset = -4.0; //Subtract 4 degrees
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

  // Current sensor values for the main page of the app
  // Overwrites the "/current..." paths each time a sensor value is read
  // ------------------------------------------------------------------
  // Temperature
  if (Firebase.RTDB.setFloat(&fbdata, "/greenhouseCurrent/temperature", t)) {
    Serial.println("Temperature data sent successfully to Firebase.");
  } else {
    Serial.print("Failed to send temperature data: ");
    Serial.println(fbdata.errorReason());
  }

  // Humidity
  if (Firebase.RTDB.setFloat(&fbdata, "/greenhouseCurrent/humidity", h)) {
    Serial.println("Humidity data sent successfully to Firebase.");
  } else {
    Serial.print("Failed to send humidity data: ");
    Serial.println(fbdata.errorReason());
  }

  // Light
  if (Firebase.RTDB.setInt(&fbdata, "/greenhouseCurrent/light", visible_only)) {
    Serial.println("Visible light sent to Firebase");
  } else {
    Serial.print("Failed to send visible light: ");
    Serial.println(fbdata.errorReason());
  }


  // Historical sensor values for the deatil views of the app
  // Builds a JSON object for the historical sensor readings
  // The path is "/greenhouse/sensor1/history"
  // Firebase will generate a unique key for each push so a time series can be retrieved on the frontend
  // ------------------------------------------------------------------
  {
  json.clear();
  json.set("temperature", t);
  json.set("humidity", h);
  json.set("light", visible_only);
  json.set("timestamp", (long)now);

  String historyPath = "/greenhouseHistory";

  if (Firebase.RTDB.pushJSON(&fbdata, historyPath, &json)) {
    Serial.println("Historical sensor data pushed to firebase.");
  } else {
    Serial.print("Failed to push historical data: ");
    Serial.println(fbdata.errorReason());
    }
  }


  // Wait 15 minutes before next reading.
  delay(900000);
}

