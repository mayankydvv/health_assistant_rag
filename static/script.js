// Function to append a message (used for both user and bot)
function appendMessage(sender, text) {
    const chatbox = document.getElementById("chat-messages");
    const msg = document.createElement("div");
    
    // Basic styling for chat messages (you should refine this in style.css)
    msg.style.cssText = `
        margin: 5px 0; 
        padding: 8px; 
        border-radius: 5px; 
        background-color: ${sender === 'user' ? '#e0f7fa' : '#f1f8e9'}; 
        text-align: ${sender === 'user' ? 'right' : 'left'};
        color: ${sender === 'user' ? '#00838f' : '#388e3c'};
        float: ${sender === 'user' ? 'right' : 'left'};
        clear: both;
        max-width: 80%;
    `;

    msg.innerText = text;
    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to bottom
}

// Function to send the message to the backend
function sendMessage(message) {
    if (!message.trim()) return;

    appendMessage('user', message);
    document.getElementById("symptomInput").value = ""; // Clear input

    fetch("/chat", { // Use the /chat endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {
        if (data.response) {
            appendMessage('bot', data.response);
        } else {
            appendMessage('bot', "Sorry, I couldn't process your request.");
        }
    })
    .catch(err => {
        appendMessage('bot', "Error communicating with the assistant.");
        console.error(err);
    });
}

// Handler for the "Send" button (text input)
function handleSymptomInput() {
    const symptomText = document.getElementById("symptomInput").value;
    sendMessage(symptomText);
}

// Modified speakSymptom for voice input
function speakSymptom() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();
        document.getElementById("symptomInput").placeholder = "Listening...";

        recognition.onresult = (event) => {
            const symptom = event.results[0][0].transcript;
            document.getElementById("symptomInput").value = symptom;
            document.getElementById("symptomInput").placeholder = "Type your symptom or click to speak...";
            
            // Send the spoken symptom
            sendMessage(symptom);
        };

        recognition.onerror = (event) => {
            document.getElementById("symptomInput").placeholder = "Type your symptom or click to speak...";
            appendMessage('bot', 'Voice input error: ' + event.error);
        };
    } else {
        alert("Speech Recognition not supported in this browser.");
    }
}

// Add event listener for Enter key on the input field
document.getElementById("symptomInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleSymptomInput();
    }
});


// --- UPDATED Reminder Logic ---

function toggleReminderFields() {
    const type = document.getElementById("reminderType").value;
    document.getElementById("minutesContainer").style.display = (type === "minutes" ? "block" : "none");
    document.getElementById("timeContainer").style.display = (type === "today" || type === "daily" ? "block" : "none");
}

function setReminder() {
    const medicine = document.getElementById("medicine").value.trim();
    const rtype = document.getElementById("reminderType").value;
    let data = { medicine: medicine, type: rtype };

    if (medicine === "") {
        alert("Please enter a medicine name.");
        return;
    }

    if (rtype === "minutes") {
        const minutes = document.getElementById("minutesInput").value;
        if (minutes === "" || parseInt(minutes) <= 0) {
            alert("Please enter a valid number of minutes.");
            return;
        }
        data.minutes = minutes;
    } else if (rtype === "today" || rtype === "daily") {
        const time = document.getElementById("timeInput").value;
        if (time === "") {
            alert("Please enter a time.");
            return;
        }
        data.time = time;
    }

    fetch("/set_reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.status);
        loadActiveReminders(); // Reload reminders list
    })
    .catch(err => console.error("Error setting reminder:", err));
}

function loadActiveReminders() {
    fetch("/get-active-reminders")
        .then(res => res.json())
        .then(reminders => {
            const container = document.getElementById("activeReminders");
            let html = '<h2>Your Active Reminders</h2>';
            if (reminders.error) {
                html += `<p>${reminders.error}</p>`;
                container.innerHTML = html;
                return;
            }

            if (reminders.length === 0) {
                html += '<p>No active reminders set.</p>';
            } else {
                reminders.forEach(r => {
                    const isPassed = r.time_passed;
                    
                    let buttonsHtml = '';
                    if (isPassed) {
                        // Show action buttons only when the time has passed
                        buttonsHtml = `
                            <button onclick="markReminderCompleted('${r.id}')" style="background-color: #4CAF50; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                                Mark Done
                            </button>
                            <button onclick="snoozeReminder('${r.id}')" style="background-color: #ff9800; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-left: 5px;">
                                Snooze (5m)
                            </button>
                            <button onclick="skipDose('${r.id}')" style="background-color: #f44336; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-left: 5px;">
                                Skip Dose
                            </button>
                        `;
                    } else {
                        // Display status if time has not passed
                        buttonsHtml = `<span style="color: #1e88e5;">Awaiting trigger...</span>`;
                    }

                    html += `
                        <div style="border: 1px solid ${isPassed ? '#ff0000' : '#ccc'}; padding: 10px; margin: 10px 0; background-color: ${isPassed ? '#fff3e0' : 'white'};">
                            <div style="font-size: 1.1em; font-weight: bold; margin-bottom: 5px;">
                                ${r.medicine} 
                                ${isPassed ? '<span style="color: red; margin-left: 10px;">(DUE NOW!)</span>' : ''}
                            </div>
                            <div style="margin-bottom: 10px; color: #666;">
                                ${r.time}
                            </div>
                            <div style="display: flex; justify-content: flex-start;">
                                ${buttonsHtml}
                            </div>
                        </div>
                    `;
                });
            }
            container.innerHTML = html;
        })
        .catch(err => console.error("Error loading reminders:", err));
}

// Function to handle Snooze
function snoozeReminder(id) {
    const minutes = 5; // Fixed snooze time for simplicity
    fetch("/snooze-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, minutes: minutes })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadActiveReminders(); 
    })
    .catch(err => console.error("Error snoozing reminder:", err));
}

// Function to handle Skip Dose
function skipDose(id) {
    if (!confirm("Are you sure you want to skip this dose?")) return;

    fetch("/skip-dose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadActiveReminders(); 
    })
    .catch(err => console.error("Error skipping dose:", err));
}

// Modified function to Mark Done
function markReminderCompleted(id) {
    fetch("/update-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, completed: true })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            loadActiveReminders();
        } else {
            alert("Could not update reminder status.");
        }
    })
    .catch(err => console.error("Error marking reminder completed:", err));
}


// --- Chart and Log Logic (UNTOUCHED) ---

function loadSicknessFrequency() {
    fetch("/sickness-frequency")
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('sicknessChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Frequency of Sickness',
                        data: data.data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(err => console.error("Error loading sickness frequency:", err));
}

function loadHealthLogs() {
    fetch("/view-logs-json")
        .then(res => res.json())
        .then(logs => {
            const logContent = document.getElementById("logContent");
            if (logs.error) {
                logContent.innerHTML = `<p>${logs.error}</p>`;
                return;
            }

            if (logs.length === 0) {
                logContent.innerHTML = "<p>No health logs available.</p>";
                return;
            }

            let tableHtml = `
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Symptoms</th>
                            <th>Remedies</th>
                            <th>Reminders</th>
                            <th>Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            logs.forEach(log => {
                tableHtml += `
                    <tr>
                        <td>${log.timestamp}</td>
                        <td>${log.symptoms}</td>
                        <td>${log.remedies.replace(/{|}/g, '').replace(/,/g, ', ').replace(/'/g, '')}</td>
                        <td>${log.reminders}</td>
                        <td>${log.feedback}</td>
                    </tr>
                `;
            });

            tableHtml += `
                    </tbody>
                </table>
            `;
            logContent.innerHTML = tableHtml;
        })
        .catch(err => {
            document.getElementById("logContent").innerHTML = "<p>Error loading logs.</p>";
            console.error("Error loading logs:", err);
        });
}

function toggleLogs() {
    const logDiv = document.getElementById("healthLogs");
    logDiv.style.display = logDiv.style.display === "none" ? "block" : "none";
}

// Initial load functions
window.onload = () => {
    loadActiveReminders();
    loadSicknessFrequency();
    loadHealthLogs();
    toggleReminderFields(); // Ensure correct fields are visible on load
    document.getElementById("healthLogs").style.display = "none"; // Logs hidden by default
    
    // Initial message for the chat box
    const chatbox = document.getElementById("chat-messages");
    if (chatbox && chatbox.children.length === 0) {
        appendMessage('bot', "Hello! Describe your symptoms, and I'll try to help.");
    }
};