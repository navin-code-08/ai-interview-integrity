import cv2

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

cap = cv2.VideoCapture(0)

no_face_counter = 0
multiple_face_events = 0
no_face_events = 0

multiple_face_flag = False
no_face_flag = False

while True:

    ret, frame = cap.read()

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5
    )

    face_count = len(faces)

    print("Faces detected:", face_count)

    # MULTIPLE FACE DETECTION
    if face_count > 1:
        if not multiple_face_flag:
            multiple_face_events += 1
            print("WARNING: Multiple people detected!")
            multiple_face_flag = True
    else:
        multiple_face_flag = False

    # NO FACE DETECTION
    if face_count == 0:
        no_face_counter += 1

        if no_face_counter > 30 and not no_face_flag:
            no_face_events += 1
            print("ALERT: Candidate left screen")
            no_face_flag = True
    else:
        no_face_counter = 0
        no_face_flag = False

    # Draw rectangles
    for (x, y, w, h) in faces:
        cv2.rectangle(
            frame,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

    cv2.putText(
        frame,
        f"Faces: {face_count}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 0, 255),
        2
    )

    cv2.imshow("AI Interview Monitoring", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# Risk score calculation
risk_score = multiple_face_events * 20 + no_face_events * 10

print("\n===== Interview Report =====")
print("Multiple Face Events:", multiple_face_events)
print("No Face Events:", no_face_events)
print("Risk Score:", risk_score, "%")

if risk_score > 40:
    print("Status: Suspicious")
else:
    print("Status: Safe")