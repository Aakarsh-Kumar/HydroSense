from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from model import SmartWaterManagement as SWM
swm= SWM()

app = Flask(__name__)
CORS(app, origins=["*"])

water_data = {
    "flow_rate": 0,
    "total_usage": 0,
    "status": "OFF",
    "potential_leak": False,
    "leak_probability": "2.26"
}

motor_status = {"state": "OFF"}

@app.route('/update', methods=['POST'])
def update_data():
    global water_data
    data = request.json
    water_data["flow_rate"] = data.get("flow_rate", 0)
    water_data["total_usage"] = data.get("total_usage", 0)

    print(f"Flow Rate: {water_data['flow_rate']} L/min")

    smart_water_system = SWM()
    result = smart_water_system.detect_leak(
        live_flow_rate=water_data["flow_rate"],
        total_water_usage=water_data["total_usage"]
    )
    print(result)
    water_data["potential_leak"] = result["leak_status"]
    water_data["leak_probability"] = float(result["leak_probability"])
    if result["leak_status"] == "Leak Detected":
        motor_status["state"] = "OFF"

    return jsonify({"message": "Data received and processed!"}), 200

@app.route('/predict', methods=['GET'])
def predict_usage():
    smart_water_system = SWM()
    prediction = smart_water_system.predict_weekly_usage()
    return jsonify(prediction)

@app.route('/data', methods=['GET'])
def get_data():
    print(water_data,"==================================================================")
    return jsonify(water_data)

@app.route('/motor', methods=['POST'])
def control_motor():
    global motor_status
    data = request.json
    state = data.get("state", "OFF") 
    motor_status["state"] = state

    try:
        requests.post("http://<ESP8266_IP>/motor", json={"state": state})  
    except:
        print("ESP not responding")
    
    return jsonify({"message": f"Motor turned {state}"}), 200

@app.route('/motor-status', methods=['GET'])
def get_motor_status():
    return jsonify(motor_status)

if __name__ == '__main__':
    app.run(host="192.168.23.239", port=5000, debug=True)


