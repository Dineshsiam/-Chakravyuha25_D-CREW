from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import json, datetime, os, joblib
import numpy as np
import pandas as pd
import qrcode

app = Flask(__name__)
CORS(app)

# ------------------------------
# File paths
# ------------------------------
DATA_FILE = "data/employees.json"
STOCK_FILE = "data/raw_materials.json"
MODEL_FILE = "data/model.pkl"

# ------------------------------
# Helper functions
# ------------------------------
def load_stock():
    if not os.path.exists(STOCK_FILE):
        return []
    with open(STOCK_FILE, "r") as f:
        return json.load(f)

def save_stock(data):
    os.makedirs("data", exist_ok=True)
    with open(STOCK_FILE, "w") as f:
        json.dump(data, f, indent=4)

def load_employees():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_employees(employees):
    os.makedirs("data", exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(employees, f, indent=4)

def load_model():
    if not os.path.exists(MODEL_FILE):
        return None
    return joblib.load(MODEL_FILE)

# ------------------------------
# Stock APIs
# ------------------------------
@app.route("/api/stock", methods=["GET"])
def get_stock():
    stocks = load_stock()
    for s in stocks:
        if "last_updated" not in s:
            s["last_updated"] = datetime.datetime.now().isoformat()
        if "category" not in s:
            s["category"] = "General"
    return jsonify(stocks)

@app.route("/api/stock", methods=["POST"])
def add_stock():
    data = request.get_json()
    if not data or "material" not in data or "quantity" not in data:
        return jsonify({"error": "Missing fields"}), 400

    stocks = load_stock()
    new_id = max([s.get("id", 0) for s in stocks], default=0) + 1

    new_stock = {
        "id": new_id,
        "material": data["material"],
        "quantity": int(data["quantity"]),
        "category": data.get("category", "General"),
        "unit": data.get("unit", "pcs"),
        "avg_daily_use": int(data.get("avg_daily_use", 0)),
        "lead_time_days": int(data.get("lead_time_days", 1)),
        "demand_trend": float(data.get("demand_trend", 1.0)),
        "last_restock": datetime.datetime.now().strftime("%Y-%m-%d"),
        "last_updated": datetime.datetime.now().isoformat()
    }

    stocks.append(new_stock)
    save_stock(stocks)
    return jsonify({"status": "created", "stock": new_stock})


@app.route("/api/stock_stats", methods=["GET"])
def stock_stats():
    stocks = load_stock()
    total_predicted = sum(s.get("quantity", 0) * 2 for s in stocks)
    total_actual = sum(s.get("quantity", 0) * 1.6 for s in stocks)
    efficiency = (total_actual / total_predicted * 100) if total_predicted > 0 else 0

    return jsonify({
        "predicted_completion": total_predicted,
        "actual_completion": total_actual,
        "efficiency": round(efficiency, 2)
    })


# ------------------------------
# Employee APIs
# ------------------------------
@app.route("/api/employees", methods=["GET"])
def get_employees():
    return jsonify(load_employees())

@app.route("/api/attendance", methods=["POST"])
def toggle_attendance():
    data = request.get_json()
    emp_id = str(data.get("id"))
    if not emp_id:
        return jsonify({"error": "Employee ID missing"}), 400

    today = datetime.date.today().strftime("%Y-%m-%d")
    now = datetime.datetime.now().strftime("%H:%M:%S")
    employees = load_employees()
    updated = False

    for emp in employees:
        if str(emp["id"]) == emp_id:
            emp["working"] = not emp.get("working", False)
            today_record = next((a for a in emp["attendance"] if a["date"] == today), None)

            if emp["working"]:
                if today_record is None:
                    emp["attendance"].append({"date": today, "login_time": now, "logout_time": None})
                else:
                    today_record["login_time"] = now
                    today_record["logout_time"] = None
            else:
                if today_record and not today_record.get("logout_time"):
                    today_record["logout_time"] = now
            updated = True
            break

    if not updated:
        return jsonify({"status": "unknown_user"}), 404

    save_employees(employees)
    return jsonify({"status": "ok", "id": emp_id, "working": emp["working"]})

@app.route("/api/add_employee", methods=["POST"])
def add_employee():
    data = request.get_json()
    if not data or "name" not in data or "department" not in data or "age" not in data:
        return jsonify({"error": "Missing fields"}), 400

    employees = load_employees()
    new_id = max([e["id"] for e in employees], default=0) + 1

    new_emp = {
        "id": new_id,
        "name": data["name"],
        "age": int(data["age"]),
        "department": data["department"],
        "working": False,
        "qr_code": f"qrcodes/emp_{new_id}.png",
        "attendance": []
    }

    os.makedirs("qrcodes", exist_ok=True)
    qr_data = {"id": new_id, "name": new_emp["name"], "department": new_emp["department"]}
    img = qrcode.make(json.dumps(qr_data))
    img.save(new_emp["qr_code"])

    employees.append(new_emp)
    save_employees(employees)
    return jsonify({"status": "created", "employee": new_emp})

@app.route("/api/qr/<int:emp_id>", methods=["GET"])
def get_qr(emp_id):
    employees = load_employees()
    emp = next((e for e in employees if e["id"] == emp_id), None)
    if not emp:
        return jsonify({"error": "Employee not found"}), 404
    if not os.path.exists(emp["qr_code"]):
        return jsonify({"error": "QR code not found"}), 404
    return send_file(emp["qr_code"], mimetype="image/png")

@app.route("/api/stats", methods=["GET"])
def get_stats():
    employees = load_employees()
    ageSegmentation = {}
    departments = {}

    for e in employees:
        age_group = f"{(e['age'] // 10) * 10}s"
        if age_group not in ageSegmentation:
            ageSegmentation[age_group] = {"count": 0, "productivity": 0}
        if e.get("working"):
            ageSegmentation[age_group]["count"] += 1
            ageSegmentation[age_group]["productivity"] += 1

        dept = e["department"]
        if dept not in departments:
            departments[dept] = {"target": 100, "achieved": 0}
        if e.get("working"):
            departments[dept]["achieved"] += 10

    ageSegmentation_list = [{"age_group": k, **v} for k, v in ageSegmentation.items()]
    departments_list = [{"department": k, **v} for k, v in departments.items()]

    predicted_output = 1000
    actual_output = sum(d["achieved"] for d in departments_list)
    efficiency = (actual_output / predicted_output) * 100

    return jsonify({
        "predicted_output": predicted_output,
        "actual_output": actual_output,
        "efficiency": efficiency,
        "ageSegmentation": ageSegmentation_list,
        "departments": departments_list
    })

# ------------------------------
# ML Prediction API
@app.route("/api/predict", methods=["POST"])
def predict_output():
    model = load_model()
    if model is None:
        return jsonify({"error": "Model file not found"}), 404

    data = request.get_json()
    if not data or "features" not in data:
        return jsonify({"error": "Missing 'features' in request"}), 400

    try:
        # Define expected feature names exactly like training
        feature_names = [
            "customer_order",
            "efficiency",
            "cycle_time_min",
            "manpower",
            "foam_available",
            "spring_available"
        ]

        features = data["features"]

        if not isinstance(features, dict):
            return jsonify({"error": "features should be a dict with keys: " + ", ".join(feature_names)}), 400

        # Ensure all features are present
        missing = [f for f in feature_names if f not in features]
        if missing:
            return jsonify({"error": f"Missing feature(s): {', '.join(missing)}"}), 400

        # Convert to DataFrame
        input_df = pd.DataFrame([features], columns=feature_names)

        prediction = model.predict(input_df)
        return jsonify({
            "status": "success",
            "input": features,
            "prediction": float(prediction[0])
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/api/stock/<int:stock_id>", methods=["DELETE"])
def delete_stock(stock_id):
    stocks = load_stock()
    stock_exists = any(s["id"] == stock_id for s in stocks)
    if not stock_exists:
        return jsonify({"error": "Stock item not found"}), 404

    # Filter out the stock to delete
    stocks = [s for s in stocks if s["id"] != stock_id]
    save_stock(stocks)
    return jsonify({"status": "deleted", "id": stock_id})


# ------------------------------
# App Start
# ------------------------------
if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f, indent=4)
    if not os.path.exists(STOCK_FILE):
        with open(STOCK_FILE, "w") as f:
            json.dump([], f, indent=4)
    app.run(debug=True, port=5000)
