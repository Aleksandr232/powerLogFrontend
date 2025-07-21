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
  // Новое состояние для пользователя
  const [user, setUser] = useState<{
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  } | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const sports = ['Бег', 'Гребля', 'Велоспорт'];
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setTg(window.Telegram.WebApp);
      window.Telegram.WebApp.ready();
      // Автоматически подстраиваем тему
      document.body.style.background = window.Telegram.WebApp.themeParams.bg_color || '';
    }
  }, []);

  useEffect(() => {
    // Получаем id из query-параметра
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      fetch(`http://localhost:3001/api/user/${id}`)
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => setUser(null));
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
    setWorkouts(workouts.filter((_, i: number) => i !== idx));
  };

  return (
    <div className="tg-diary">
      {/* Верхняя панель */}
      <div className="header-bar">
        <img className="avatar" src={user?.avatar_url || 'https://ui-avatars.com/api/?name=Гость'} alt="avatar" />
        <span className="user-name">{user ? `${user.first_name} ${user.last_name}` : 'Гость'}</span>
      </div>
      {/* Центральная часть */}
      {!started ? (
        <div className="center-block">
          <button className="start-btn" onClick={() => setStarted(true)}>
            <span className="start-icon">⚡</span> Начать тренировку
          </button>
        </div>
      ) : !sport ? (
        <div className="choose-sport">
          <h2>Выберите вид спорта</h2>
          <div className="sport-options">
            {sports.map((s) => (
              <button
                key={s}
                className="sport-card"
                onClick={() => setSport(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h1>Дневник тренировок — {sport}</h1>
          <div className="add-block">
            <input
              type="text"
              placeholder="Новая тренировка..."
              value={note}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addWorkout()}
            />
            <button onClick={addWorkout}>+</button>
          </div>
          <ul className="workout-list">
            {workouts.length === 0 && <li className="empty">Нет записей</li>}
            {workouts.map((w: {date: string, note: string}, idx: number) => (
              <li key={idx} className="workout-item">
                <span className="date">{w.date}</span>
                <span className="note">{w.note}</span>
                <button className="remove" onClick={() => removeWorkout(idx)}>&times;</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
