import React, { useState, useEffect } from 'react';
import './App.css';

declare global {
  interface Window {
    Telegram: any;
  }
}

function App() {
  const [workouts, setWorkouts] = useState<{date: string, note: string}[]>([]);
  const [note, setNote] = useState('');
  const [tg, setTg] = useState<any>(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setTg(window.Telegram.WebApp);
      window.Telegram.WebApp.ready();
      // Автоматически подстраиваем тему
      document.body.style.background = window.Telegram.WebApp.themeParams.bg_color || '';
    }
  }, []);

  useEffect(() => {
    if (tg) {
      if (workouts.length > 0) {
        tg.MainButton.setText('Сохранить');
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
          tg.sendData(JSON.stringify(workouts));
        });
      } else {
        tg.MainButton.hide();
      }
    }
    // Очищаем обработчик при размонтировании
    return () => {
      if (tg) tg.MainButton.offClick();
    };
  }, [tg, workouts]);

  const addWorkout = () => {
    if (note.trim()) {
      setWorkouts([{ date: new Date().toLocaleDateString(), note }, ...workouts]);
      setNote('');
    }
  };

  const removeWorkout = (idx: number) => {
    setWorkouts(workouts.filter((_, i) => i !== idx));
  };

  return (
    <div className="tg-diary">
      <h1>Дневник тренировок</h1>
      <div className="add-block">
        <input
          type="text"
          placeholder="Новая тренировка..."
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addWorkout()}
        />
        <button onClick={addWorkout}>+</button>
      </div>
      <ul className="workout-list">
        {workouts.length === 0 && <li className="empty">Нет записей</li>}
        {workouts.map((w, idx) => (
          <li key={idx} className="workout-item">
            <span className="date">{w.date}</span>
            <span className="note">{w.note}</span>
            <button className="remove" onClick={() => removeWorkout(idx)}>&times;</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
