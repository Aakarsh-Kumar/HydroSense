#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

#define WIFI_SSID "SPYPER"
#define WIFI_PASSWORD "motogp25"

#define SERVER_URL "http://192.168.23.239:5000"

#define FLOW_SENSOR_PIN 4  
#define RELAY_PIN 5     

volatile int pulseCount = 0;
float flowRate = 0.0, totalUsage = 0.0;
unsigned long lastTime = 0;
unsigned long lastTotalTime= 0;
WiFiClient client;
void IRAM_ATTR pulseCounter() {
    pulseCount++;
}

void setup() {
    Serial.begin(115200);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

    pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);
}

float calculateFlowRate() {
    float flow = (pulseCount / 7.5); 
    pulseCount = 0;
    return flow;
}

void sendDataToBackend(float flow, float total) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(client,SERVER_URL "/update");
        http.addHeader("Content-Type", "application/json");

        String payload = "{\"flow_rate\": " + String(flow, 2) + ", \"total_usage\": " + String(total, 2) + "}";
        int httpResponseCode = http.POST(payload);

        Serial.print("Data Sent: ");
        Serial.println(payload);
        Serial.print("Response Code: ");
        Serial.println(httpResponseCode);

        http.end();
    } else {
        Serial.println("Wi-Fi Disconnected! Data not sent.");
    }
}

void getMotorStatus() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(client,SERVER_URL "/motor-status");
        int httpResponseCode = http.GET();

        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.print("Motor Status Response: ");
            Serial.println(response);

            if (response.indexOf("\"state\": \"ON\"") != -1) {
                digitalWrite(RELAY_PIN, LOW);
            } else {
                digitalWrite(RELAY_PIN, HIGH);
            }
        } else {
            Serial.print("Failed to get motor status! Error: ");
            Serial.println(httpResponseCode);
        }

        http.end();
    }
}

void loop() {
    if (millis() - lastTime >= 1000) { 
        lastTime = millis();
        flowRate = calculateFlowRate();
        totalUsage += flowRate;
        if (millis()-lastTotalTime>=3600000){

        sendDataToBackend(flowRate, totalUsage);
        }
        else{
            sendDataToBackend(flowRate,0);
            lastTotalTime = millis();
        }
        getMotorStatus();
    }
}
