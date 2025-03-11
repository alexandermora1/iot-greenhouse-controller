# iot-greenhouse-controller

Project for ACIT4015 Internet of Things at OsloMet.

This repository contains a prototype system designed to help hobby gardeners monitor and maintain optimal conditions in a perspnal greenhouse. It integrates sensor data collection on an ESP32 microcontroller with a cross platform mobile application built using React Native. The mobile app displays real-time and historical environmental data, enabling users to keep track of temperature, humidity, and light levels in their greenhouse.

The project runs from March 3 to April 25, 2025.  
<br/>

## Project Overview
This project was developed as part of the ACIT4015 Internet of Things course, where students are encouraged to propose and implement an IoT project aligned with their academic background. My study program is Universal Design of ICT, so a key focus is on accessibility and inclusive design in the mobile application interface.  
<br/>

## What Is It?
The IoT Greenhouse Controller aims to:

Collect real-time data on temperature, humidity, and light using an ESP32-S3-MINI-1 microcontroller with a SHT-31 sensor for temperature/humidity and an LTR329ALS sensor for light.
Send the collected data to a Firebase Realtime Database for storage and synchronization.
Provide a React Native mobile application (built with Expo) to display both real-time and historical sensor readings.
Simulate control actions by sending push notifications (via Pushsafer) when certain thresholds (e.g., low temperature, high humidity) are crossed.
Although the prototype does not directly control any physical devices, it simulates actions such as turning lights on/off or adjusting ventilation, illustrating how full automation could be integrated in a future version.  
<br/>

## Features
### Monitoring
View temperature, humidity, and light readings from the greenhouse at 15-minute intervals. This approach minimizes data usage while still offering timely insights into changing conditions.

### Historical Data Visualization
Explore trends over time through history charts. This helps you identify patterns or recurring issues in the greenhouse environment.

### Push Notifications
Receive alerts for conditions that fall outside your configured thresholds (e.g., low light during winter days or extreme temperatures).

### Accessibility and Universal Design
Built with a focus on inclusive design to ensure the app can be used by the widest possible audience.

### Cross-Platform
Built with React Native and Expo, so the application runs on both Android and iOS devices.  
<br/>

## Technology Stack
### Hardware:
- ESP32-S3-MINI-1
- SHT-31 Sensor
- LTR329ALS Light Sensor
  
### Backend & Cloud Services:
- Firebase Realtime Database
- Pushsafer for notifications

### Mobile App:
- React Native and Expo for cross-platform development
  - UI Libraries:
    - React Native Paper for ready-made and accessible UI components
    - react-native-chart-kit for rendering charts of historical data

### Programming Languages:
- C++ for the microcontroller firmware
- JavaScript/TypeScript for the mobile application  
<br/>

## Architecture
    +------------+         Wi-Fi        +---------------+
    | ESP32-S3   | ------------------>  |  Firebase     |                  
    | (SHT-31 &  |                      |  Realtime DB  |
    | LTR329ALS) | <------------------  +---------------+
    +------------+          Sync          |            
           |                              |           
           | (Push notifications)         |           
           v                              |           
     +-------------+                      |           
     |  Pushsafer  |                      |           
     +-------------+                      |           
                                          v           
                (User views data & notifications)     
                          |                       
                  +-----------------+
                  | React Native    |
                  |   Mobile App    |
                  | (Expo)          |
                  +-----------------+

- The ESP32 collects data from the sensors and sends it to Firebase.
- The React Native app retrieves the data from Firebase and displays it in real time and via historical charts.
- Pushsafer is used to send notifications when certain thresholds are reached.  
<br/>

## How It Works
### 1. Sensor Data Collection
The ESP32 polls the SHT-31 (temperature/humidity) and the LTR329ALS (light) at fixed intervals. Sensor readings are sent to the Firebase Realtime Database.

### 2. Data Storage and Sync
Firebase stores incoming sensor data in a structured, time-stamped format. The React Native app subscribes to Firebase updates, so any change in sensor readings is reflected almost instantly in the app.

### 3. Historical Data
Historical records are stored in Firebase. The React Native app leverages react-native-chart-kit to display this data in line charts or bar charts, making it easy to spot trends.

### 4. Notifications
If sensor values exceed predefined thresholds (e.g., temperature falls below 10°C or humidity rises above 80%), the ESP32 triggers a request to Pushsafer, which sends a push notification to your mobile device. This simulates what a real automation system might do to, for example, turn on a heater or open a vent.

