import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pomodoro, setPomodoro] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [minutes, setMinutes] = useState(pomodoro);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("pomodoro");
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortMethod, setSortMethod] = useState("manual"); // 'manual', 'dueDate', 'creationDate', 'status'
  const [alertSound, setAlertSound] = useState("beep"); // 'beep', 'bell', 'chime'
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [currentEdit, setCurrentEdit] = useState({ title: "", description: "", dueDate: "" });
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  const audioRef = useRef(null);

  const soundOptions = {
    beep: "https://www.soundjay.com/buttons/sounds/button-1.mp3",
    bell: "https://www.soundjay.com/buttons/sounds/bell-ringing-05.mp3",
    chime: "https://www.soundjay.com/buttons/sounds/button-chime-01.mp3",
  };

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) {
      setTasks(savedTasks);
    }
    const savedSettingsRaw = localStorage.getItem("pomodoroSettings");
    if (savedSettingsRaw) {
      const savedSettings = JSON.parse(savedSettingsRaw);
      if (savedSettings) {
        setPomodoro(Number(savedSettings.pomodoro) || 25);
        setShortBreak(Number(savedSettings.shortBreak) || 5);
        setLongBreak(Number(savedSettings.longBreak) || 15);
        setMinutes(Number(savedSettings.pomodoro) || 25);
        setAlertSound(savedSettings.alertSound || "beep");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            handleTimerEnd();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const handleTimerEnd = () => {
    if (audioRef.current) {
        audioRef.current.src = soundOptions[alertSound];
        audioRef.current.play();
    }
    if (mode === "pomodoro") {
      setPomodoroCount(pomodoroCount + 1);
      if ((pomodoroCount + 1) % 4 === 0) {
        setMode("longBreak");
        setMinutes(longBreak);
      } else {
        setMode("shortBreak");
        setMinutes(shortBreak);
      }
    } else {
      setMode("pomodoro");
      setMinutes(pomodoro);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "pomodoro") {
      setMinutes(pomodoro);
    } else if (mode === "shortBreak") {
      setMinutes(shortBreak);
    } else {
      setMinutes(longBreak);
    }
    setSeconds(0);
  };

  const addTask = () => {
    if (title.trim()) {
      const newTask = {
        id: Date.now(),
        title,
        description,
        completed: false,
        dueDate,
        creationDate: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setCurrentEdit({ title: task.title, description: task.description, dueDate: task.dueDate });
  };
  
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setCurrentEdit({ title: "", description: "", dueDate: "" });
  };
  
  const handleUpdateTask = (id) => {
    if (currentEdit.title.trim()) {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, ...currentEdit } : task
      ));
      handleCancelEdit();
    }
  };

  const handleCurrentEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentEdit(prev => ({ ...prev, [name]: value }));
     if (e.target.tagName.toLowerCase() === 'textarea') {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const sortedTasks = useMemo(() => {
    let tasksToSort = [...tasks];
    switch (sortMethod) {
      case 'dueDate':
        return tasksToSort.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      case 'creationDate':
        return tasksToSort.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
      case 'status':
        return tasksToSort.sort((a, b) => Number(a.completed) - Number(b.completed));
      case 'manual':
      default:
        return tasks;
    }
  }, [tasks, sortMethod]);

  const handleDragStart = (e, task) => {
    if (sortMethod !== 'manual') return;
    setDraggingItemId(task.id);
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, task) => {
    e.preventDefault();
    if (sortMethod !== 'manual' || !draggingItemId || task.id === draggingItemId) return;
    setDragOverItemId(task.id);
  };

  const handleDrop = (e, dropTask) => {
    if (sortMethod !== 'manual' || !draggingItemId) return;

    const draggedTaskId = e.dataTransfer.getData("taskId");
    if (draggedTaskId === dropTask.id.toString()) return;

    const draggedIndex = tasks.findIndex(t => t.id.toString() === draggedTaskId);
    const dropIndex = tasks.findIndex(t => t.id === dropTask.id);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(dropIndex, 0, draggedTask);
    setTasks(newTasks);
    
    setDraggingItemId(null);
    setDragOverItemId(null);
  };
  
  const handleDragEnd = () => {
    setDraggingItemId(null);
    setDragOverItemId(null);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const newPomodoro = parseInt(e.target.pomodoro.value, 10);
    const newShortBreak = parseInt(e.target.shortBreak.value, 10);
    const newLongBreak = parseInt(e.target.longBreak.value, 10);
    const newAlertSound = e.target.alertSound.value;

    setPomodoro(newPomodoro);
    setShortBreak(newShortBreak);
    setLongBreak(newLongBreak);
    setAlertSound(newAlertSound);
    setMinutes(newPomodoro);

    localStorage.setItem(
      "pomodoroSettings",
      JSON.stringify({
        pomodoro: newPomodoro,
        shortBreak: newShortBreak,
        longBreak: newLongBreak,
        alertSound: newAlertSound,
      })
    );
    setIsModalOpen(false);
  };

  const RADIUS = 50;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const progressOffset = useMemo(() => {
    const totalDuration = (mode === 'pomodoro' ? pomodoro : mode === 'shortBreak' ? shortBreak : longBreak) * 60;
    if (totalDuration === 0) return 0;
    const elapsedSeconds = totalDuration - (minutes * 60 + seconds);
    const progressPercentage = elapsedSeconds / totalDuration;
    return CIRCUMFERENCE * (1 - progressPercentage);
  }, [minutes, seconds, mode, pomodoro, shortBreak, longBreak]);


  return (
    <>
      <main className="dashboard">
        <div className="dashboard-panel">
            <section className="card timer-section">
                <div className="section-header">
                    <h2>Pomodoro Timer</h2>
                    <button className="icon-btn" id="settings-btn" onClick={() => setIsModalOpen(true)}>
                        <i className="fas fa-cog"></i>
                    </button>
                </div>
                <div className="circle-progress-container">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle className="progress-ring__track" cx="60" cy="60" r={RADIUS} />
                        <circle 
                            className="progress-ring__indicator" 
                            cx="60" 
                            cy="60" 
                            r={RADIUS} 
                            style={{
                                strokeDasharray: CIRCUMFERENCE,
                                strokeDashoffset: progressOffset
                            }}
                        />
                    </svg>
                    <div id="timer-display">
                        {String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                    </div>
                </div>
                <div className="timer-controls">
                    <button onClick={toggleTimer} className="btn-primary"><i className={`fas ${isActive ? 'fa-pause' : 'fa-play'}`}></i> {isActive ? "Pause" : "Start"}</button>
                    <button onClick={resetTimer} className="btn-secondary">
                      <i className="fas fa-rotate-right"></i> Reset
                    </button>
                </div>
            </section>
            
            <section className="card composer-section">
                <div className="section-header">
                    <h2>Add a Task</h2>
                </div>
                <div className="task-composer">
                    <input
                      id="task-title"
                      type="text"
                      placeholder="What needs to be done?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                      id="task-description"
                      placeholder="Add a description..."
                      rows={1}
                      value={description}
                      onChange={handleDescriptionChange}
                    ></textarea>
                    <div className="composer-actions">
                      <input
                          id="task-due-date"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                      />
                      <button id="add-task-btn" onClick={addTask} className="btn-primary">
                        <i className="fas fa-plus"></i> Add Task
                      </button>
                    </div>
                </div>
            </section>
        </div>

        <div className="dashboard-panel tasks-panel">
            <section className="card tasks-section">
              <div className="task-list-header">
                <h3>Your Tasks</h3>
                <div className="sort-container">
                    <label htmlFor="sort-tasks">Sort by:</label>
                    <select id="sort-tasks" value={sortMethod} onChange={(e) => setSortMethod(e.target.value)}>
                        <option value="manual">Manual</option>
                        <option value="dueDate">Due Date</option>
                        <option value="creationDate">Creation Date</option>
                        <option value="status">Status</option>
                    </select>
                </div>
              </div>

              <ul id="task-list">
                {sortedTasks.map((task) => {
                   const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
                   const classNames = [
                     "task-item",
                     task.completed ? "completed" : "",
                     isOverdue ? "overdue" : "",
                     draggingItemId === task.id ? "is-dragging" : "",
                     dragOverItemId === task.id ? "drag-over" : "",
                   ].filter(Boolean).join(" ");
                   
                   return (
                  <li
                    key={task.id}
                    className={classNames}
                    draggable={sortMethod === 'manual' && editingTaskId !== task.id}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnter={(e) => handleDragEnter(e, task)}
                    onDrop={(e) => handleDrop(e, task)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                  >
                    {editingTaskId === task.id ? (
                      <div className="edit-form">
                        <input type="text" name="title" value={currentEdit.title} onChange={handleCurrentEditChange} placeholder="Task Title"/>
                        <textarea name="description" value={currentEdit.description} onChange={handleCurrentEditChange} placeholder="Description" rows={1}></textarea>
                        <input type="date" name="dueDate" value={currentEdit.dueDate} onChange={handleCurrentEditChange} />
                        <div className="edit-actions">
                            <button className="btn-primary" onClick={() => handleUpdateTask(task.id)}>Save</button>
                            <button className="btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="task-content">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(task.id)}
                            id={`task-checkbox-${task.id}`}
                          />
                           <label htmlFor={`task-checkbox-${task.id}`} className="custom-checkbox"></label>
                          <div className="task-text">
                            <span>{task.title}</span>
                            {task.description && (
                              <p className="task-description-text">{task.description}</p>
                            )}
                            {task.dueDate && (
                                <p className="task-due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="task-actions">
                          <button className="icon-btn" onClick={() => handleEdit(task)}>
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button className="icon-btn" onClick={() => deleteTask(task.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                )})}
              </ul>
            </section>
        </div>
      </main>
      
      <div className={`modal-overlay ${isModalOpen ? "show" : ""}`}>
        <div className="modal-content">
          <button className="close-btn" onClick={() => setIsModalOpen(false)}>
            &times;
          </button>
          <h2>Settings</h2>
          <form className="settings-form" onSubmit={saveSettings}>
            <label htmlFor="pomodoro">Pomodoro (minutes)</label>
            <input
              type="number"
              id="pomodoro"
              defaultValue={pomodoro}
              min="1"
            />
            <label htmlFor="shortBreak">Short Break (minutes)</label>
            <input
              type="number"
              id="shortBreak"
              defaultValue={shortBreak}
              min="1"
            />
            <label htmlFor="longBreak">Long Break (minutes)</label>
            <input
              type="number"
              id="longBreak"
              defaultValue={longBreak}
              min="1"
            />
            <label htmlFor="alertSound">Alert Sound</label>
            <select id="alertSound" defaultValue={alertSound}>
                <option value="beep">Beep</option>
                <option value="bell">Bell</option>
                <option value="chime">Chime</option>
            </select>
            <button className="btn-primary" id="save-settings-btn" type="submit">
              Save Settings
            </button>
          </form>
        </div>
      </div>

      <footer className="ad-footer">
        <div id="google-ad-rectangle" aria-label="Advertisement">
          {/* PASTE YOUR GOOGLE AD CODE HERE */}
        </div>
      </footer>

      <audio ref={audioRef}/>
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);