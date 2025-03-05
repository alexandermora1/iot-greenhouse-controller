/*************************************************** 
  This is an example for the SHT31-D Humidity & Temp Sensor

  Designed specifically to work with the SHT31-D sensor from Adafruit
  ----> https://www.adafruit.com/products/2857

  These sensors use I2C to communicate, 2 pins are required to  
  interface
 ****************************************************/
 
#include <Arduino.h>
// #include <FirebaseJson.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include <Wire.h>
#include <SPI.h>
#include "Adafruit_SHT31.h"
#include "credentials.h"


// Token generation process info
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool enableHeater = false;
uint8_t loopCnt = 0;

Adafruit_SHT31 sht31 = Adafruit_SHT31();

void setup() {
  Serial.begin(115200);

  while (!Serial)
    delay(10);     // will pause Zero, Leonardo, etc until serial console opens

  Serial.println("SHT31 test");
  if (! sht31.begin(0x44)) {   // Set to 0x45 for alternate i2c addr
    Serial.println("Couldn't find SHT31");
    while (1) delay(1);
  }

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("Connected to Wi-Fi");

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
  float t = sht31.readTemperature();
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

  // Wait 10 seconds before next reading
  delay(10000);
}