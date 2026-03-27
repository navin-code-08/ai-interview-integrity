from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import subprocess
import random
import sys
import os
from groq import Groq

app = Flask(__name__)
CORS(app)

# ─── Admin token ──────────────────────────────────────────────────────────────
ADMIN_TOKEN = "admin-secret-2026"

# ─── Coding question bank ─────────────────────────────────────────────────────
question_bank = {
    1: {"input": "2 3",       "expected": "5",    "marks": 10},
    2: {"input": "hello",     "expected": "olleh","marks": 10},
    3: {"input": "1 5 3",     "expected": "5",    "marks": 10}
}

question_pool = [
    {"id":1,"title":"Sum of Two Numbers","description":"Add two numbers","input":"2 3","output":"5"},
    {"id":2,"title":"Reverse String","description":"Reverse a string","input":"hello","output":"olleh"},
    {"id":3,"title":"Find Max","description":"Find max number","input":"1 5 3","output":"5"},
    {"id":4,"title":"Count Words","description":"Count words in sentence","input":"hello world","output":"2"},
    {"id":5,"title":"Even or Odd","description":"Check number","input":"4","output":"Even"},
    {"id":6,"title":"Square Number","description":"Square input","input":"5","output":"25"}
]

# ─── Engineering quiz question bank (50 questions) ───────────────────────────
QUESTIONS = [
    # Python (10)
    {"id":1,  "category":"Python","question":"What is the output of print(type([]))?","options":["<class 'list'>","<class 'array'>","<class 'tuple'>","<class 'dict'>"],"answer":"<class 'list'>"},
    {"id":2,  "category":"Python","question":"Which keyword defines a function in Python?","options":["func","define","def","function"],"answer":"def"},
    {"id":3,  "category":"Python","question":"What does len('hello') return?","options":["4","5","6","error"],"answer":"5"},
    {"id":4,  "category":"Python","question":"Which of these is mutable in Python?","options":["tuple","string","list","int"],"answer":"list"},
    {"id":5,  "category":"Python","question":"What is a lambda function?","options":["A named function","An anonymous function","A recursive function","A built-in function"],"answer":"An anonymous function"},
    {"id":6,  "category":"Python","question":"What does 'self' refer to in a Python class?","options":["The class itself","The parent class","The current instance","A static variable"],"answer":"The current instance"},
    {"id":7,  "category":"Python","question":"Which method removes the last item from a list?","options":["remove()","delete()","pop()","discard()"],"answer":"pop()"},
    {"id":8,  "category":"Python","question":"What is the result of 3 ** 2 in Python?","options":["6","9","8","None"],"answer":"9"},
    {"id":9,  "category":"Python","question":"Which keyword handles exceptions in Python?","options":["catch","handle","except","error"],"answer":"except"},
    {"id":10, "category":"Python","question":"What does range(3) produce?","options":["[1,2,3]","[0,1,2,3]","[0,1,2]","[1,2]"],"answer":"[0,1,2]"},

    # Data Structures (10)
    {"id":11, "category":"Data Structures","question":"Time complexity of accessing an array element by index?","options":["O(n)","O(log n)","O(1)","O(n²)"],"answer":"O(1)"},
    {"id":12, "category":"Data Structures","question":"Which data structure uses LIFO order?","options":["Queue","Stack","Linked List","Tree"],"answer":"Stack"},
    {"id":13, "category":"Data Structures","question":"Average time complexity of binary search?","options":["O(n)","O(n²)","O(log n)","O(1)"],"answer":"O(log n)"},
    {"id":14, "category":"Data Structures","question":"Which data structure uses FIFO order?","options":["Stack","Tree","Queue","Graph"],"answer":"Queue"},
    {"id":15, "category":"Data Structures","question":"Worst-case time complexity of quicksort?","options":["O(n log n)","O(n)","O(n²)","O(log n)"],"answer":"O(n²)"},
    {"id":16, "category":"Data Structures","question":"Hash table average-case lookup time?","options":["O(n)","O(log n)","O(1)","O(n log n)"],"answer":"O(1)"},
    {"id":17, "category":"Data Structures","question":"Which tree traversal visits root node first?","options":["Inorder","Postorder","Preorder","Level order"],"answer":"Preorder"},
    {"id":18, "category":"Data Structures","question":"Best-case time complexity of bubble sort?","options":["O(n²)","O(n log n)","O(n)","O(1)"],"answer":"O(n)"},
    {"id":19, "category":"Data Structures","question":"In a min-heap, the root node contains?","options":["The largest value","The median value","The smallest value","A random value"],"answer":"The smallest value"},
    {"id":20, "category":"Data Structures","question":"Which data structure is used for BFS?","options":["Stack","Queue","Heap","Array"],"answer":"Queue"},

    # OOP (5)
    {"id":21, "category":"OOP","question":"What is encapsulation?","options":["Hiding internal details","Inheriting from parent","Overriding methods","Creating objects"],"answer":"Hiding internal details"},
    {"id":22, "category":"OOP","question":"What is polymorphism?","options":["Same interface, different behaviour","Multiple inheritance","Data hiding","Object creation"],"answer":"Same interface, different behaviour"},
    {"id":23, "category":"OOP","question":"What does inheritance allow?","options":["Hiding data","A class to reuse another class's code","Running code faster","Creating interfaces"],"answer":"A class to reuse another class's code"},
    {"id":24, "category":"OOP","question":"What is an abstract class?","options":["A class with no methods","A class that cannot be instantiated directly","A private class","A static class"],"answer":"A class that cannot be instantiated directly"},
    {"id":25, "category":"OOP","question":"What is method overriding?","options":["Defining a method twice in same class","Redefining a parent method in child class","Using two methods with same name","None of the above"],"answer":"Redefining a parent method in child class"},

    # Databases (5)
    {"id":26, "category":"Databases","question":"Which SQL command retrieves data?","options":["INSERT","UPDATE","SELECT","DELETE"],"answer":"SELECT"},
    {"id":27, "category":"Databases","question":"What is a primary key?","options":["A key that can be null","A key that uniquely identifies each row","A foreign reference","A duplicate key"],"answer":"A key that uniquely identifies each row"},
    {"id":28, "category":"Databases","question":"What does JOIN do in SQL?","options":["Deletes rows","Combines rows from two tables","Creates a new table","Updates records"],"answer":"Combines rows from two tables"},
    {"id":29, "category":"Databases","question":"What is normalization?","options":["Speeding up queries","Organizing data to reduce redundancy","Creating indexes","Backing up data"],"answer":"Organizing data to reduce redundancy"},
    {"id":30, "category":"Databases","question":"What does ACID stand for in databases?","options":["Array, Class, Index, Data","Atomicity, Consistency, Isolation, Durability","Access, Control, Insert, Delete","None of above"],"answer":"Atomicity, Consistency, Isolation, Durability"},

    # Networking (5)
    {"id":31, "category":"Networking","question":"What port does HTTPS use by default?","options":["80","21","443","8080"],"answer":"443"},
    {"id":32, "category":"Networking","question":"What does DNS stand for?","options":["Domain Name System","Data Network Service","Digital Naming Structure","Domain Node Server"],"answer":"Domain Name System"},
    {"id":33, "category":"Networking","question":"Purpose of a firewall?","options":["Speed up internet","Block unauthorized access","Store data","Assign IP addresses"],"answer":"Block unauthorized access"},
    {"id":34, "category":"Networking","question":"Which protocol is used to send emails?","options":["FTP","HTTP","SMTP","SSH"],"answer":"SMTP"},
    {"id":35, "category":"Networking","question":"What does IP stand for?","options":["Internet Protocol","Internal Process","Input Port","Index Pointer"],"answer":"Internet Protocol"},

    # OS (5)
    {"id":36, "category":"OS","question":"Which Linux command lists files?","options":["dir","list","ls","show"],"answer":"ls"},
    {"id":37, "category":"OS","question":"What is virtual memory?","options":["RAM only","Disk space used as extra RAM","GPU memory","Cloud storage"],"answer":"Disk space used as extra RAM"},
    {"id":38, "category":"OS","question":"What does 'chmod' do in Linux?","options":["Change directory","Change file permissions","Check memory","Copy file"],"answer":"Change file permissions"},
    {"id":39, "category":"OS","question":"What is a deadlock?","options":["A crashed program","Two processes waiting on each other forever","A full hard drive","A network timeout"],"answer":"Two processes waiting on each other forever"},
    {"id":40, "category":"OS","question":"What does the 'kill' command do?","options":["Delete a file","Terminate a process","Restart the OS","Clear memory"],"answer":"Terminate a process"},

    # Web (5)
    {"id":41, "category":"Web","question":"Which HTML tag creates a hyperlink?","options":["<link>","<href>","<a>","<url>"],"answer":"<a>"},
    {"id":42, "category":"Web","question":"What does REST stand for?","options":["Remote Execution State Transfer","Representational State Transfer","Real-time Event Streaming Technology","None"],"answer":"Representational State Transfer"},
    {"id":43, "category":"Web","question":"Which HTTP method sends data to a server?","options":["GET","DELETE","POST","PUT"],"answer":"POST"},
    {"id":44, "category":"Web","question":"What is CORS?","options":["A CSS property","Cross-Origin Resource Sharing","A database term","A Python library"],"answer":"Cross-Origin Resource Sharing"},
    {"id":45, "category":"Web","question":"What does JSON stand for?","options":["Java Scripted Object Name","JavaScript Object Notation","Java Source Object Node","None"],"answer":"JavaScript Object Notation"},

    # Git & Algorithms (5)
    {"id":46, "category":"Git","question":"What does 'git commit' do?","options":["Uploads to GitHub","Saves a snapshot of changes","Deletes files","Merges branches"],"answer":"Saves a snapshot of changes"},
    {"id":47, "category":"Git","question":"What does 'git push' do?","options":["Download code","Create branch","Upload commits to remote","Delete remote"],"answer":"Upload commits to remote"},
    {"id":48, "category":"Algorithms","question":"What is a recursive function?","options":["A function that runs once","A function that calls itself","A loop function","A built-in function"],"answer":"A function that calls itself"},
    {"id":49, "category":"Algorithms","question":"What is Big O notation used for?","options":["Measuring memory","Describing algorithm time complexity","Naming variables","Writing tests"],"answer":"Describing algorithm time complexity"},
    {"id":50, "category":"Algorithms","question":"Which sorting algorithm is fastest on average?","options":["Bubble sort","Selection sort","Quick sort","Insertion sort"],"answer":"Quick sort"},
]

# ─── Database init ────────────────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect("candidates.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            interview_time INTEGER DEFAULT 0,
            risk_score INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Safe',
            quiz_score INTEGER DEFAULT 0,
            quiz_percentage INTEGER DEFAULT 0,
            quiz_results TEXT,
            hr_transcript TEXT,
            hr_completed INTEGER DEFAULT 0,
            coding_score INTEGER DEFAULT 0,
            final_score INTEGER DEFAULT 0,
            final_grade TEXT
        )
    """)
    for col in [
        "quiz_score INTEGER DEFAULT 0",
        "quiz_percentage INTEGER DEFAULT 0",
        "quiz_results TEXT",
        "hr_transcript TEXT",
        "hr_completed INTEGER DEFAULT 0",
        "coding_score INTEGER DEFAULT 0",
        "final_score INTEGER DEFAULT 0",
        "final_grade TEXT"
    ]:
        try:
            c.execute(f"ALTER TABLE candidates ADD COLUMN {col}")
        except:
            pass
    conn.commit()
    conn.close()
    print("Database ready: candidates.db")

init_db()

# ─── Login ────────────────────────────────────────────────────────────────────
@app.route('/login', methods=['POST'])
def login():
    data  = request.json
    name  = data.get('name')
    email = data.get('email')
    conn  = sqlite3.connect("candidates.db")
    c     = conn.cursor()
    c.execute("SELECT id FROM candidates WHERE email=?", (email,))
    existing = c.fetchone()
    if existing:
        c.execute("""
            UPDATE candidates
            SET name=?, interview_time=0, risk_score=0, status='Safe',
                quiz_score=0, quiz_percentage=0, quiz_results=NULL,
                hr_transcript=NULL, hr_completed=0,
                coding_score=0, final_score=0, final_grade=NULL
            WHERE email=?
        """, (name, email))
    else:
        c.execute("""
            INSERT INTO candidates
            (name, email, interview_time, risk_score, status,
             quiz_score, quiz_percentage, coding_score, final_score, final_grade)
            VALUES (?,?,0,0,'Safe',0,0,0,0,NULL)
        """, (name, email))
    conn.commit()
    conn.close()
    return jsonify({"message": "Candidate ready"})

@app.route('/submit_aptitude', methods=['POST'])
def submit_aptitude():
    import json
    data            = request.get_json()
    candidate_email = data.get('email', '')
    score           = data.get('score', 0)
    percentage      = data.get('percentage', 0)
    results         = data.get('results', [])

    try:
        conn = sqlite3.connect("candidates.db")
        c    = conn.cursor()
        try:
            c.execute("ALTER TABLE candidates ADD COLUMN aptitude_score INTEGER DEFAULT 0")
        except: pass
        try:
            c.execute("ALTER TABLE candidates ADD COLUMN aptitude_percentage INTEGER DEFAULT 0")
        except: pass
        try:
            c.execute("ALTER TABLE candidates ADD COLUMN aptitude_results TEXT")
        except: pass
        c.execute("""
            UPDATE candidates
            SET aptitude_score=?, aptitude_percentage=?, aptitude_results=?
            WHERE email=?
        """, (score, percentage, json.dumps(results), candidate_email))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Aptitude save error: {e}")

    return jsonify({"score": score, "percentage": percentage, "message": "Saved"})

# ─── Quiz routes ──────────────────────────────────────────────────────────────
@app.route('/get_quiz', methods=['GET'])
def get_quiz():
    selected = random.sample(QUESTIONS, min(10, len(QUESTIONS)))
    return jsonify({"questions": [
        {"id": q["id"], "category": q["category"],
         "question": q["question"], "options": q["options"]}
        for q in selected
    ]})

@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    import json
    data            = request.get_json()
    candidate_email = data.get('email', '')
    answers         = data.get('answers', {})

    score   = 0
    total   = len(answers)
    results = []

    for q_id_str, selected in answers.items():
        q_id     = int(q_id_str)
        question = next((q for q in QUESTIONS if q['id'] == q_id), None)
        if question:
            correct    = question['answer']
            is_correct = (selected == correct)
            if is_correct:
                score += 1
            results.append({
                "id":         q_id,
                "category":   question["category"],
                "question":   question["question"],
                "options":    question["options"],
                "selected":   selected,
                "correct":    correct,
                "is_correct": is_correct
            })

    percentage = round((score / total) * 100) if total > 0 else 0

    try:
        conn = sqlite3.connect("candidates.db")
        c    = conn.cursor()
        c.execute("""
            UPDATE candidates
            SET quiz_score=?, quiz_percentage=?, quiz_results=?
            WHERE email=?
        """, (score, percentage, json.dumps(results), candidate_email))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB save error: {e}")

    return jsonify({"score": score, "total": total,
                    "percentage": percentage, "results": results})

# ─── Save result ──────────────────────────────────────────────────────────────
@app.route('/save_result', methods=['POST'])
def save_result():
    data = request.json
    conn = sqlite3.connect("candidates.db")
    c    = conn.cursor()
    c.execute("""
        UPDATE candidates
        SET interview_time=?, risk_score=?, status=?
        WHERE email=?
    """, (data['interview_time'], data['risk_score'], data['status'], data['email']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Result saved successfully"})

# ─── Candidates (admin only) ──────────────────────────────────────────────────
@app.route('/candidates', methods=['GET'])
def get_candidates():
    token = request.headers.get('X-Admin-Token', '')
    if token != ADMIN_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401

    conn = sqlite3.connect("candidates.db")
    c    = conn.cursor()
    c.execute("""
        SELECT id, name, email, interview_time, risk_score, status,
               quiz_score, quiz_percentage, hr_completed,
               coding_score, final_score, final_grade
        FROM candidates
    """)
    rows = c.fetchall()
    conn.close()
    return jsonify([{
        "id": r[0], "name": r[1], "email": r[2],
        "interview_time": r[3], "risk_score": r[4], "status": r[5],
        "quiz_score": r[6], "quiz_percentage": r[7], "hr_completed": r[8],
        "coding_score": r[9], "final_score": r[10], "final_grade": r[11]
    } for r in rows])

# ─── Clear all candidates (admin only) ───────────────────────────────────────
@app.route('/clear_candidates', methods=['DELETE'])
def clear_candidates():
    token = request.headers.get('X-Admin-Token', '')
    if token != ADMIN_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401

    conn = sqlite3.connect("candidates.db")
    c    = conn.cursor()
    c.execute("DELETE FROM candidates")
    conn.commit()
    conn.close()
    return jsonify({"message": "All candidates deleted"})

# ─── Coding routes ────────────────────────────────────────────────────────────
@app.route("/get_coding_questions")
def get_questions():
    selected = random.sample(question_pool, 3)
    return jsonify(selected)

@app.route("/run_code", methods=["POST"])
def run_code():
    data     = request.json
    code     = data.get("code")
    language = data.get("language")
    output   = ""
    try:
        if language == "python":
            with open("temp.py", "w") as f:
                f.write(code)
            result = subprocess.check_output(
                [sys.executable, "temp.py"], timeout=5
            )
            output = result.decode()
        elif language == "javascript":
            with open("temp.js", "w") as f:
                f.write(code)
            result = subprocess.check_output(["node", "temp.js"], timeout=5)
            output = result.decode()
        else:
            output = "Language not supported yet"
    except Exception as e:
        output = str(e)
    return jsonify({"output": output})

@app.route("/submit_coding", methods=["POST"])
def submit_coding():
    data            = request.json
    answers         = data.get("answers", {})
    candidate_email = data.get("email", "")
    total_score     = 0

    for qid, code in answers.items():
        qid      = int(qid)
        question = question_bank.get(qid)
        if not question:
            continue
        try:
            with open("temp.py", "w") as f:
                f.write(code)
            result = subprocess.check_output(
                [sys.executable, "temp.py"],
                input=question["input"].encode(),
                timeout=5
            ).decode().strip()
            if result == question["expected"]:
                total_score += question["marks"]
        except:
            pass

    if candidate_email:
        try:
            conn = sqlite3.connect("candidates.db")
            c    = conn.cursor()
            c.execute(
                "UPDATE candidates SET coding_score=? WHERE email=?",
                (total_score, candidate_email)
            )
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Coding score save error: {e}")

    return jsonify({"score": total_score, "max": 30})

# ─── Final score ──────────────────────────────────────────────────────────────
@app.route('/calculate_final_score', methods=['POST'])
def calculate_final_score():
    import json
    data  = request.get_json()
    email = data.get('email', '')

    conn = sqlite3.connect("candidates.db")
    c    = conn.cursor()
    c.execute("""
        SELECT coding_score, quiz_score, quiz_percentage,
               hr_completed, risk_score, quiz_results
        FROM candidates WHERE email=?
    """, (email,))
    row = c.fetchone()

    if not row:
        conn.close()
        return jsonify({"error": "Candidate not found"}), 404

    coding_score = row[0] or 0
    quiz_score   = row[1] or 0
    hr_completed = row[3] or 0
    risk_score   = row[4] or 0
    quiz_results = json.loads(row[5]) if row[5] else []

    quiz_marks = round((quiz_score / 10) * 40)
    hr_marks   = 30 if hr_completed else 0
    total      = coding_score + quiz_marks + hr_marks

    if total >= 85:   grade = "A+"
    elif total >= 75: grade = "A"
    elif total >= 65: grade = "B"
    elif total >= 50: grade = "C"
    elif total >= 35: grade = "D"
    else:             grade = "F"

    c.execute(
        "UPDATE candidates SET final_score=?, final_grade=? WHERE email=?",
        (total, grade, email)
    )
    conn.commit()
    conn.close()

    return jsonify({
        "coding_score": coding_score, "coding_max": 30,
        "quiz_marks":   quiz_marks,   "quiz_max":   40,
        "hr_marks":     hr_marks,     "hr_max":     30,
        "total":        total,        "total_max":  100,
        "grade":        grade,
        "risk_score":   risk_score,
        "quiz_results": quiz_results,
        "passed":       total >= 50
    })

# ─── AI HR Interview (Groq) ───────────────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

HR_SYSTEM_PROMPT = """You are a professional HR interviewer conducting a technical job interview.
Your job is to assess the candidate fairly and professionally.

Rules:
- Ask ONE question at a time. Never ask multiple questions together.
- Start by greeting the candidate and asking them to introduce themselves.
- After their intro, ask about their experience, skills, strengths, weaknesses, projects, and situational questions.
- Ask follow-up questions based on their answers to dig deeper.
- After 10 exchanges, wrap up politely and say the interview is complete.
- Keep responses concise — 2 to 4 sentences maximum.
- Be encouraging but professional. Never be rude.
- Do not reveal you are an AI unless directly asked."""

@app.route('/start_hr_interview', methods=['POST'])
def start_hr_interview():
    data           = request.get_json()
    candidate_name = data.get('name', 'Candidate')
    try:
        client     = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=300,
            messages=[
                {"role": "system", "content": HR_SYSTEM_PROMPT},
                {"role": "user",   "content": f"The candidate's name is {candidate_name}. Start the interview now."}
            ]
        )
        return jsonify({"message": completion.choices[0].message.content, "exchange_count": 0})
    except Exception as e:
        print(f"Groq error: {e}")
        return jsonify({"message": f"Error: {str(e)}", "exchange_count": 0}), 500

@app.route('/hr_chat', methods=['POST'])
def hr_chat():
    data            = request.get_json()
    candidate_email = data.get('email', '')
    candidate_name  = data.get('name', 'Candidate')
    history         = data.get('history', [])
    exchange_count  = data.get('exchange_count', 0)
    try:
        client   = Groq(api_key=GROQ_API_KEY)
        messages = [
            {"role": "system", "content": HR_SYSTEM_PROMPT},
            {"role": "user",   "content": f"The candidate's name is {candidate_name}. Start the interview now."}
        ]
        for entry in history:
            messages.append({"role": "assistant", "content": entry['ai']})
            if entry.get('candidate'):
                messages.append({"role": "user", "content": entry['candidate']})

        completion  = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=300,
            messages=messages
        )
        ai_response = completion.choices[0].message.content
        new_count   = exchange_count + 1
        is_complete = (
            new_count >= 10 or
            "interview is complete" in ai_response.lower() or
            "thank you for your time" in ai_response.lower() or
            "best of luck" in ai_response.lower()
        )

        if is_complete and candidate_email:
            transcript = "\n\n".join([
                f"HR: {e['ai']}\nCandidate: {e.get('candidate','')}"
                for e in history
            ]) + f"\n\nHR: {ai_response}"
            try:
                conn = sqlite3.connect("candidates.db")
                c    = conn.cursor()
                c.execute(
                    "UPDATE candidates SET hr_transcript=?, hr_completed=1 WHERE email=?",
                    (transcript, candidate_email)
                )
                conn.commit()
                conn.close()
            except Exception as db_err:
                print(f"Transcript save error: {db_err}")

        return jsonify({
            "message":       ai_response,
            "exchange_count": new_count,
            "is_complete":   is_complete
        })
    except Exception as e:
        print(f"Groq chat error: {e}")
        return jsonify({
            "message":       f"Error: {str(e)}",
            "exchange_count": exchange_count,
            "is_complete":   False
        }), 500

# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)