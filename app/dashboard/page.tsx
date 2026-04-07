"use client";

import { useEffect, useState } from "react";

type Task = {
  _id: string;
  title: string;
  completed: boolean;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:4000/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        setTasks(data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTasks();
  }, []);

  //create tasks
  const handleCreateTask = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:4000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      // 🔥 update UI without reloading
      setTasks([data.data, ...tasks]);

      setTitle("");
    } catch (error) {
      console.log(error);
    }
  };

  // Actualizar tareas, para marcarla como completada o pediente
  const toggleTask = async (taskId: string, completed: boolean) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:4000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !completed,
        }),
      });

      const data = await response.json();

      // 🔥 actualizar UI
      setTasks(tasks.map((task) => (task._id === taskId ? data.data : task)));
    } catch (error) {
      console.log(error);
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:4000/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔥 update UI
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10">
      <form onSubmit={handleCreateTask} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Nueva tarea"
          className="border p-2 flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button className="bg-green-500 text-white px-4">Crear</button>
      </form>

      <h1 className="text-2xl mb-4">Mis Tareas</h1>

      {tasks.length === 0 ? (
        <p>No hay tareas</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task._id} className="border p-2 flex justify-between">
              <span>{task.title}</span>

              <button onClick={() => toggleTask(task._id, task.completed)}>
                {task.completed ? "✅" : "❌"}
              </button>

              <button
                onClick={() => deleteTask(task._id)}
                className="text-red-500"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
