#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "SPYPER";
const char* password = "motogp25";

const String SERVER_URL = "http://192.168.23.239:5000"; 
WiFiClient client;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    Serial.print(WiFi.status());
  }

  Serial.println("\nWiFi connected");
}

void loop() {
  float flowRate = 3.5;
  float totalVolume = 45.0;

  sendDataToBackend(flowRate, totalVolume);
  delay(5000);
}

void sendDataToBackend(float flow, float total) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(client, SERVER_URL + "/update");
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"flow_rate\": " + String(flow) + ", \"total_volume\": " + String(total) + "}";
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully!");
    } else {
      Serial.println("Error sending data: " + String(httpResponseCode));
    }

    http.end();
  }
}

void getMotorStatus() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(client, SERVER_URL + "/motor-status");
    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String response = http.getString();
      Serial.println("Motor Status: " + response);
    } else {
      Serial.println("Failed to get motor status.");
    }

    http.end();
  }
}
