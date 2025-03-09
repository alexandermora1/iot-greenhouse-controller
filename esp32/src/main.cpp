
 
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
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Remove?
// bool enableHeater = false;
// uint8_t loopCnt = 0;


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

  // Configure and begin firebase
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_DB_URL;

  // Sign up or sign in
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase SignUp successful");
  } else {
    Serial.printf("SignUp Error: %s\n", config.signer.signupError.message.c_str());
  }

  // Initialize the library
  Firebase.begin(&config, &auth);
}


void loop() {
  // Read SHT31 and offset to account for incorrect temperature value
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

  // Write temperature to the database (float)
  if (Firebase.RTDB.setFloat(&fbdo, "/greenhouse/sensor1/temperature", t)) {
    Serial.println("Temperature data sent successfully to Firebase.");
  } else {
    Serial.print("Failed to send temperature data: ");
    Serial.println(fbdo.errorReason());
  }

  // Write humidity to the database (float)
  if (Firebase.RTDB.setFloat(&fbdo, "/greenhouse/sensor1/humidity", h)) {
    Serial.println("Humidity data sent successfully to Firebase.");
  } else {
    Serial.print("Failed to send humidity data: ");
    Serial.println(fbdo.errorReason());
  }

  // Write light values to the database
  if (Firebase.RTDB.setInt(&fbdo, "/greenhouse/sensor1/light/visible", visible_only)) {
    Serial.println("Visible light sent to Firebase");
  } else {
    Serial.print("Failed to send visible light: ");
    Serial.println(fbdo.errorReason());
  }

  // Wait 60 seconds before next reading
  delay(60000);
}

