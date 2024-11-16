import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Chart from "chart.js/auto";
import "./Home.css";
import CalendarComponent from "./Calender/CalendarComponent"; // Ensure this path is correct

const Home = () => {
  const location = useLocation();
  const username = location.state?.username || "Guest";
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(() => {
    const savedCategories = JSON.parse(localStorage.getItem("categories"));
    return savedCategories || ["food", "entertainment", "shopping", "travel", "others"]; // Default categories
  });
  const [newCategory, setNewCategory] = useState("");
  const chartRef = useRef(null);

  const populateDate = () => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
  };

  const updateTime = () => {
    const now = new Date();
    setTime(now.toTimeString().split(" ")[0]);
  };

  const saveExpenses = (expensesToSave) => {
    localStorage.setItem("expenses", JSON.stringify(expensesToSave));
  };

  const loadExpenses = () => {
    const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(storedExpenses);
  };

  const filterTodayExpenses = () => {
    const today = new Date().toISOString().split("T")[0];
    return expenses.filter((expense) => expense.date === today);
  };

  const groupExpensesByCategory = () => {
    const todayExpenses = filterTodayExpenses();
    const groupedExpenses = categories.reduce((acc, category) => {
      acc[category] = 0; // Initialize with 0 for existing categories
      return acc;
    }, {});
  
    todayExpenses.forEach((expense) => {
      if (groupedExpenses.hasOwnProperty(expense.type)) {
        groupedExpenses[expense.type] += parseFloat(expense.amount);
      }
    });
  
    // Filter out any category with no expenses
    const validCategories = Object.keys(groupedExpenses).filter(category => groupedExpenses[category] > 0);
    return validCategories.reduce((acc, category) => {
      acc[category] = groupedExpenses[category];
      return acc;
    }, {});
  };
  const updateExpensesSummary = () => {
    const todayExpenses = filterTodayExpenses();
    let totalToday = 0;

    todayExpenses.forEach((expense) => {
      totalToday += parseFloat(expense.amount);
    });

    return { totalToday };
  };


  const saveCategoriesToLocalStorage = (newCategories) => {
    localStorage.setItem("categories", JSON.stringify(newCategories));
  };
  const handleDeleteCategory = (categoryToDelete) => {
    // Update the categories
    const updatedCategories = categories.filter((category) => category !== categoryToDelete);
    setCategories(updatedCategories);
    saveCategoriesToLocalStorage(updatedCategories);
  
    // Remove expenses linked to the deleted category
    const updatedExpenses = expenses.filter((expense) => expense.type !== categoryToDelete);
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
  
    // Update the chart after deleting the category
    setTimeout(() => {
      window.location.reload();
    }, 100); // Ensures the chart gets updated after the state is set
  };
  
  
  const updateDonutChart = () => {
    const ctx = document.getElementById("expense-donut-chart").getContext("2d");
  
    // Get grouped expenses after filtering out deleted categories
    const groupedExpenses = groupExpensesByCategory();
    const totalExpenses = Object.values(groupedExpenses).reduce((acc, val) => acc + val, 0);
  
    // Filter out categories and expenses that have been deleted
    const validCategories = Object.keys(groupedExpenses);
    const validExpenses = validCategories.map(category => groupedExpenses[category]);
  
    // Destroy the previous chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }
  
    const colors = [
      "#c47b84", "#0012fb", "#3366ff", "#7c3a28", "#FF00FF", "#00FFFF",
      "#FFA500", "#800080", "#808000", "#008080", "#A52A2A", "#FFFFFF",
      "#000000", "#C0C0C0", "#FFC0CB"
    ];
  
    // Create the new chart with valid data
    if (validCategories.length > 0) {
      chartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: validCategories,
          datasets: [
            {
              data: validExpenses,
              backgroundColor: colors.slice(0, validCategories.length),
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "right",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const percentage = ((context.raw / totalExpenses) * 100).toFixed(2);
                  return `${label}: Rs ${context.raw} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    } else {
      chartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["No Expenses"],
          datasets: [
            {
              data: [1],
              backgroundColor: ["#C0C0C0"],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "right",
            },
            tooltip: {
              callbacks: {
                label: () => "No Expenses",
              },
            },
          },
        },
      });
    }
  };
  
  const handleAddExpense = (e) => {
    e.preventDefault();
    const newExpense = { description, amount, type, date, time };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    setDescription("");
    setAmount("");
    setType("");
  };

  const handleDeleteExpense = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
    if (confirmDelete) {
      const updatedExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(updatedExpenses);
      saveExpenses(updatedExpenses);
    }
  };

  const handleDeleteAll = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all records?");
    if (confirmDelete) {
      setExpenses([]);
      localStorage.removeItem("expenses");
    }
  };
  

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim() !== "") {
      const lowercasedNewCategory = newCategory.trim().toLowerCase();
      if (!categories.includes(lowercasedNewCategory)) {
        const updatedCategories = [...categories, lowercasedNewCategory];
        setCategories(updatedCategories);
        saveCategoriesToLocalStorage(updatedCategories);
      }
      setNewCategory("");
    }
  };

  useEffect(() => {
    populateDate();
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    loadExpenses();
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    updateDonutChart();
  }, [expenses, categories]);

  const { totalToday } = updateExpensesSummary();
  const groupedExpenses = groupExpensesByCategory();

  return (
    <div className="main-body">
      <div className="sidebar">
        <h2>Expense Tracker</h2>
        <ul>
          <li>Dashboard</li>
          <li>Accounts</li>
          <li>Reports</li>
          <li>Settings</li>
          <li>Help</li>
          <hr />
        </ul>
        <CalendarComponent />
      </div>
      <div className="main-box">
        <div className="main-content">
          <header>
            <h1>Welcome, {username}</h1>
            <div className="search-bar">
              <input type="text" placeholder="Search transactions" />
              <img src="profile-pic.png" alt="Profile" />
            </div>
          </header>

          <div className="investment-summary">
            <div className="total-expense">
              <h3>Today's Expense</h3>
              <div className="investment-amount">Rs {totalToday.toFixed(2)}</div>
            </div>
            <div className="investment-chart">
              <canvas id="expense-donut-chart" height="200" width="500"></canvas>
            </div>
          </div>

          <div className="expenses-summary">
    <h3>Expenses by Category Today</h3>
    <div className="categories-summary">
      {categories.map((category) => (
        <div key={category} className="category-summary">
            <button
              className="delete-category-btn"
              onClick={() => handleDeleteCategory(category)}
            >
              &times;
            </button>
          <h4>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h4>
          <p>Rs {groupedExpenses[category]?.toFixed(2) || 0}</p>
        </div>
      ))}
      
      <button onClick={handleAddCategory} className="add-category">
        <input
          type="text"
          placeholder="Add Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCategory(e);
          }}
        />
      </button>
    </div>
  </div>

          <div className="expense-input">
            <h3>Add New Expense</h3>
            <form onSubmit={handleAddExpense}>
              <input
                type="text"
                placeholder="Expense Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Expense Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="" disabled hidden>
                  Expense Type
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <input type="text" value={date} readOnly placeholder="Expense Date" />
              <input type="text" value={time} readOnly placeholder="Expense Time" />
              <button type="submit">Add Expense</button>
            </form>
          </div>

          <div className="expense-table">
            <h3>Today's Expenses</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterTodayExpenses().map((expense, index) => (
                  <tr key={index}>
                    <td>{expense.description}</td>
                    <td>Rs {expense.amount}</td>
                    <td>{expense.type}</td>
                    <td>{expense.date}</td>
                    <td>{expense.time}</td>
                    <td>
                     
                    <button onClick={() => handleDeleteExpense(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleDeleteAll} className="delete-button">
              Delete All Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

