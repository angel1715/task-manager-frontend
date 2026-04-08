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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧠 PROTECTED ROUTE + FETCH
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Error al obtener tareas");
        }

        const data = await response.json();
        setTasks(data.data);
      } catch (err: any) {
        setError(err.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 🔥 CREATE TASK
  const handleCreateTask = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!title.trim()) return;

    try {
      setError("");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Error al crear tarea");
      }

      const data = await response.json();

      setTasks([data.data, ...tasks]);
      setTitle("");
    } catch (err: any) {
      setError(err.message || "Error creando tarea");
    }
  };

  // 🔥 TOGGLE TASK
  const toggleTask = async (taskId: string, completed: boolean) => {
    const token = localStorage.getItem("token");

    try {
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: !completed,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Error actualizando tarea");
      }

      const data = await response.json();

      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? data.data : task)),
      );
    } catch (err: any) {
      setError(err.message || "Error actualizando tarea");
    }
  };

  // 🔥 DELETE TASK
  const deleteTask = async (taskId: string) => {
    const token = localStorage.getItem("token");

    try {
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error eliminando tarea");
      }

      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err: any) {
      setError(err.message || "Error eliminando tarea");
    }
  };

  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="p-10 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Mis Tareas</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2"
        >
          Logout
        </button>
      </div>

      {/* 🔥 ERROR */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* 🔥 FORM */}
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

      {/* 🔥 LOADING */}
      {loading ? (
        <p>Cargando...</p>
      ) : tasks.length === 0 ? (
        <p>No hay tareas</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="border p-2 flex justify-between items-center"
            >
              <span>{task.title}</span>

              <div className="flex gap-2">
                <button onClick={() => toggleTask(task._id, task.completed)}>
                  {task.completed ? "✅" : "❌"}
                </button>

                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-red-500"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
