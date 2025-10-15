from flask import Flask, jsonify, request, send_file
import json, datetime, os
from flask_cors import CORS
import qrcode

app = Flask(__name__)
CORS(app)

DATA_FILE = "data/employees.json"

# ------------------------------
# Helper Functions
# ------------------------------
def load_employees():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_employees(employees):
    os.makedirs("data", exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(employees, f, indent=4)

# ------------------------------
# API: Get all employees
# ------------------------------
@app.route("/api/employees", methods=["GET"])
def get_employees():
    employees = load_employees()
    return jsonify(employees)

# ------------------------------
# API: Toggle Attendance (QR Check-in / Check-out)
# ------------------------------
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

            # Find today's attendance record
            today_record = next((a for a in emp["attendance"] if a["date"] == today), None)

            if emp["working"]:
                # Check-in
                if today_record is None:
                    emp["attendance"].append({
                        "date": today,
                        "login_time": now,
                        "logout_time": None
                    })
                else:
                    today_record["login_time"] = now
                    today_record["logout_time"] = None
            else:
                # Check-out
                if today_record and not today_record.get("logout_time"):
                    today_record["logout_time"] = now

            updated = True
            break

    if not updated:
        return jsonify({"status": "unknown_user"}), 404

    save_employees(employees)
    return jsonify({"status": "ok", "id": emp_id, "working": emp["working"]})

# ------------------------------
# API: Add new employee + generate QR code
# ------------------------------
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

    # Create QR code folder
    os.makedirs("qrcodes", exist_ok=True)

    # Generate QR code
    qr_data = {
        "id": new_id,
        "name": new_emp["name"],
        "department": new_emp["department"]
    }
    img = qrcode.make(json.dumps(qr_data))
    img.save(new_emp["qr_code"])

    employees.append(new_emp)
    save_employees(employees)

    return jsonify({"status": "created", "employee": new_emp})

# ------------------------------
# API: Serve QR code image
# ------------------------------
@app.route("/api/qr/<int:emp_id>", methods=["GET"])
def get_qr(emp_id):
    employees = load_employees()
    emp = next((e for e in employees if e["id"] == emp_id), None)
    if not emp:
        return jsonify({"error": "Employee not found"}), 404

    if not os.path.exists(emp["qr_code"]):
        return jsonify({"error": "QR code not found"}), 404

    return send_file(emp["qr_code"], mimetype="image/png")

# ------------------------------
# API: Dashboard Statistics
# ------------------------------
@app.route("/api/stats", methods=["GET"])
def get_stats():
    employees = load_employees()

    # Age segmentation
    ageSegmentation = {}
    for e in employees:
        age_group = f"{(e['age'] // 10) * 10}s"
        if age_group not in ageSegmentation:
            ageSegmentation[age_group] = {"count": 0, "productivity": 0}
        if e.get("working"):
            ageSegmentation[age_group]["count"] += 1
            ageSegmentation[age_group]["productivity"] += 1  # demo value

    ageSegmentation_list = [
        {"age_group": k, "count": v["count"], "productivity": v["productivity"]}
        for k, v in ageSegmentation.items()
    ]

    # Department-wise production
    departments = {}
    for e in employees:
        dept = e["department"]
        if dept not in departments:
            departments[dept] = {"target": 100, "achieved": 0}
        if e.get("working"):
            departments[dept]["achieved"] += 10  # demo productivity

    departments_list = [
        {"department": k, "target": v["target"], "achieved": v["achieved"]}
        for k, v in departments.items()
    ]

    # Efficiency
    predicted_output = 1000  # demo value
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
# App start
# ------------------------------
if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f, indent=4)
    app.run(debug=True, port=5000)
