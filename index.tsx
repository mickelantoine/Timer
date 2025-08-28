
import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  // App navigation state
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'blogList', 'blogPost'
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Existing states
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

  // --- Blog "Coded Database" ---
  const blogPosts = [
    {
      id: 1,
      title: 'The Power of the Pomodoro Technique',
      date: '2024-05-20',
      content: `
        <p>The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. The technique uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks. Each interval is known as a pomodoro, from the Italian word for 'tomato', after the tomato-shaped kitchen timer that Cirillo used as a university student.</p>
        <p><strong>Here’s how it works:</strong></p>
        <ol>
          <li>Decide on the task to be done.</li>
          <li>Set the pomodoro timer (typically for 25 minutes).</li>
          <li>Work on the task.</li>
          <li>End work when the timer rings and take a short break (typically 5 minutes).</li>
          <li>After four pomodoros, take a longer break (typically 15–30 minutes).</li>
        </ol>
        <p>This method helps you resist self-interruptions and re-train your brains to focus. Each pomodoro is a dedicated, indivisible unit of work, which helps eliminate the "just one more minute" syndrome. Try it out with our built-in timer!</p>
      `
    },
    {
      id: 2,
      title: '5 Tips for Effective Task Management',
      date: '2024-05-18',
      content: `
        <p>Feeling overwhelmed by your to-do list? Effective task management is key to productivity and peace of mind. Here are five tips to help you get started:</p>
        <ol>
          <li><strong>Break It Down:</strong> Large tasks can be daunting. Break them down into smaller, more manageable sub-tasks. This makes it easier to start and track progress.</li>
          <li><strong>Prioritize with Due Dates:</strong> Use due dates to understand what needs your immediate attention. Our app highlights overdue tasks so you never miss a deadline.</li>
          <li><strong>Add Detailed Descriptions:</strong> A task title isn't always enough. Use the description field to add notes, links, or any other context you might need later.</li>
          <li><strong>Review Regularly:</strong> Set aside time each day or week to review your task list. Remove completed items, re-prioritize as needed, and make sure you're on track.</li>
          <li><strong>Celebrate Small Wins:</strong> Ticking off a task, no matter how small, is progress. Acknowledge your accomplishments to stay motivated!</li>
        </ol>
      `
    },
    {
      id: 3,
      title: 'The Importance of Regular Breaks for Productivity',
      date: '2024-05-22',
      content: `
        <p>In a world that glorifies constant hustle, taking a break can feel like a luxury. However, scientific research and productivity experts agree: <strong>regular breaks are essential for maintaining high levels of performance, creativity, and overall well-being.</strong></p>
        <p>Pushing through hours of uninterrupted work might seem productive, but it often leads to diminished returns, mental fatigue, and burnout. Our brains are not designed for prolonged, intense focus. They need periods of rest to consolidate information and restore energy.</p>
        <h3>Benefits of Taking Breaks:</h3>
        <ul>
          <li><strong>Improved Focus:</strong> Short breaks help reset your attention span, allowing you to return to a task with renewed focus and mental clarity.</li>
          <li><strong>Reduced Stress:</strong> Stepping away from your work, even for a few minutes, can significantly reduce stress and prevent mental exhaustion.</li>
          <li><strong>Increased Creativity:</strong> Allowing your mind to wander can lead to "aha!" moments and creative solutions to problems you've been stuck on.</li>
          <li><strong>Better Decision-Making:</strong> Mental fatigue can impair judgment. A quick break can help you make more thoughtful and accurate decisions.</li>
        </ul>
        <p>This is precisely why methods like the Pomodoro Technique are so effective. By building short, scheduled breaks directly into your workflow, you create a sustainable rhythm for deep work. So next time you feel your focus waning, don't just push harder. Step away, stretch, grab a glass of water, and come back stronger.</p>
      `
    },
    {
      id: 4,
      title: 'How to Beat Procrastination for Good',
      date: '2024-05-24',
      content: `
        <p>Procrastination is a common struggle, but you can overcome it with the right strategies. This post explores the root causes of procrastination and offers actionable steps to build better habits.</p>
        <h3>Key Takeaways:</h3>
        <ul>
          <li>The 'Two-Minute Rule' to get started on any task.</li>
          <li>Breaking down overwhelming projects into micro-tasks.</li>
          <li>Understanding the link between perfectionism and procrastination.</li>
        </ul>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 5,
      title: 'Creating the Perfect Morning Routine for a Productive Day',
      date: '2024-05-26',
      content: `
        <p>How you start your day sets the tone for everything that follows. A well-structured morning routine can boost your energy, focus, and overall happiness. We explore the building blocks of a powerful morning ritual.</p>
        <h3>Elements of a Great Morning Routine:</h3>
        <ol>
          <li>Hydration and Nutrition</li>
          <li>Mindfulness or Meditation</li>
          <li>Light Exercise</li>
          <li>Planning Your Top 3 Priorities</li>
        </ol>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 6,
      title: "The Science of 'Deep Work' and How to Achieve It",
      date: '2024-05-28',
      content: `
        <p>Coined by Cal Newport, 'Deep Work' refers to the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. This article is your guide to achieving a state of deep work.</p>
        <h3>Actionable Steps:</h3>
        <ul>
          <li>Time blocking and scheduling deep work sessions.</li>
          <li>Creating a distraction-free environment.</li>
          <li>Training your focus like a muscle.</li>
        </ul>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 7,
      title: 'Declutter Your Digital Workspace for Enhanced Focus',
      date: '2024-05-30',
      content: `
        <p>A cluttered digital workspace can be as distracting as a messy physical desk. Learn how to organize your files, manage your inbox, and streamline your apps to create a serene and productive digital environment.</p>
        <p>This guide covers desktop organization, browser tab management, and notification settings to help you reclaim your focus.</p>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 8,
      title: 'Time Blocking vs. Time Boxing: Which Method is Right for You?',
      date: '2024-06-01',
      content: `
        <p>Time blocking and time boxing are two powerful time management strategies, but they aren't the same. We break down the differences, pros, and cons of each to help you decide which technique best fits your work style.</p>
        <h3>Quick Comparison:</h3>
        <ul>
          <li><strong>Time Blocking:</strong> Assigning blocks of time to work on specific tasks.</li>
          <li><strong>Time Boxing:</strong> Setting a fixed time limit to complete a task.</li>
        </ul>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 9,
      title: 'Mindfulness Techniques to Improve Concentration',
      date: '2024-06-03',
      content: `
        <p>In a world of constant notifications, maintaining concentration is a challenge. Mindfulness is a powerful tool for training your attention. This post introduces simple, effective mindfulness exercises you can do at your desk.</p>
        <p>Learn about mindful breathing, the body scan meditation, and how to apply mindfulness to everyday tasks to boost your focus and reduce stress.</p>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 10,
      title: 'Setting SMART Goals for Long-Term Success',
      date: '2024-06-05',
      content: `
        <p>The SMART goal framework is a proven method for turning vague aspirations into concrete, achievable objectives. Learn how to set goals that are Specific, Measurable, Achievable, Relevant, and Time-bound.</p>
        <p>We provide a step-by-step guide with examples to help you set and achieve your most ambitious goals.</p>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 11,
      title: 'How to Avoid Burnout While Staying Productive',
      date: '2024-06-07',
      content: `
        <p>Productivity and rest are two sides of the same coin. Pushing yourself too hard can lead to burnout, which crushes motivation and efficiency. This article explores sustainable productivity habits.</p>
        <h3>Key Strategies:</h3>
        <ul>
          <li>Recognizing the early signs of burnout.</li>
          <li>The importance of setting boundaries.</li>
          <li>Scheduling restorative activities and hobbies.</li>
        </ul>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 12,
      title: 'The Best Productivity Apps to Complement Your Workflow',
      date: '2024-06-09',
      content: `
        <p>While FocusFlow is your central hub, other tools can enhance your productivity ecosystem. We review the best apps for note-taking, project management, and habit tracking that work seamlessly with your existing workflow.</p>
        <p>Discover tools that can help you organize your thoughts, collaborate with teams, and build lasting habits.</p>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    },
    {
      id: 13,
      title: 'The Link Between Hydration, Diet, and Mental Clarity',
      date: '2024-06-11',
      content: `
        <p>What you eat and drink has a direct impact on your cognitive function. This post delves into the science behind how proper hydration and a balanced diet can boost your focus, memory, and overall brain health.</p>
        <p>Learn about brain-boosting foods and the surprising ways dehydration can sap your productivity.</p>
        <p><em>(Paste your full 4000-word article here...)</em></p>
      `
    }
  ];

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
  
  const renderDashboard = () => (
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
  );

  const renderBlogList = () => (
    <main className="blog-main">
      <section className="card blog-container">
        <div className="section-header">
          <h2>Blog</h2>
        </div>
        <ul className="blog-post-list">
          {/* Fix: Explicitly get the time from Date objects for comparison to resolve TypeScript error. */}
          {blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(post => (
            <li key={post.id} className="blog-post-preview" onClick={() => {
              setSelectedPostId(post.id);
              setCurrentView('blogPost');
            }}>
              <h3>{post.title}</h3>
              <p>{new Date(post.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );

  const renderBlogPost = () => {
    const post = blogPosts.find(p => p.id === selectedPostId);
    if (!post) return renderBlogList(); // Fallback if post not found

    return (
      <main className="blog-main">
        <section className="card blog-container blog-post-full">
           <button className="btn-secondary back-btn" onClick={() => setCurrentView('blogList')}>
              &larr; Back to Blog
            </button>
          <div className="section-header">
            <h2>{post.title}</h2>
          </div>
          <p className="post-meta">Published on {new Date(post.date).toLocaleDateString()}</p>
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
        </section>
      </main>
    );
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
      <header className="app-header">
        <h1>FocusFlow</h1>
        <nav>
          <button 
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-btn ${currentView.startsWith('blog') ? 'active' : ''}`}
            onClick={() => setCurrentView('blogList')}
          >
            Blog
          </button>
        </nav>
      </header>

      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'blogList' && renderBlogList()}
      {currentView === 'blogPost' && renderBlogPost()}
      
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
