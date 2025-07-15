import React, { useState, useEffect } from 'react';
import { Gamepad2, Plus, BookOpen, ArrowRight, ListChecks, Calendar, ChevronLeft, Save, Loader2 } from 'lucide-react';

const QuestlogApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedGame, setSelectedGame] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('questlog-entries') || '[]');
    setEntries(savedEntries);
  }, []);

  useEffect(() => {
    localStorage.setItem('questlog-entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date(),
      ...entry
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  const getGameEntries = (gameName) => {
    return entries.filter(entry => entry.gameName === gameName);
  };

  const getUniqueGames = () => {
    const gameMap = new Map();
    entries.forEach(entry => {
      if (!gameMap.has(entry.gameName)) {
        gameMap.set(entry.gameName, {
          name: entry.gameName,
          lastEntry: entry,
          entryCount: 1
        });
      } else {
        gameMap.get(entry.gameName).entryCount++;
      }
    });
    return Array.from(gameMap.values());
  };

  if (currentView === 'newEntry') {
    return (
      <NewEntryForm
        onSave={addEntry}
        onCancel={() => setCurrentView('dashboard')}
        loading={loading}
        setLoading={setLoading}
      />
    );
  }

  if (currentView === 'gameDetails' && selectedGame) {
    return (
      <GameDetails
        game={selectedGame}
        entries={getGameEntries(selectedGame.name)}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  return <Dashboard games={getUniqueGames()} onNewEntry={() => setCurrentView('newEntry')} onGameSelect={(game) => { setSelectedGame(game); setCurrentView('gameDetails'); }} />;
};

const Dashboard = ({ games, onNewEntry, onGameSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Questlog
          </h1>
          <p className="text-xl text-gray-300">Your personal video game journal</p>
        </div>

        <div className="text-center mb-12">
          <button
            onClick={onNewEntry}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center mx-auto text-lg"
          >
            <Plus className="h-6 w-6 mr-2" />
            New Quest Entry
          </button>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-16">
            <Gamepad2 className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <p className="text-xl text-gray-400 mb-2">No games logged yet</p>
            <p className="text-gray-500">Click "New Quest Entry" to start your first gaming journal!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard
                key={game.name}
                game={game}
                onClick={() => onGameSelect(game)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const GameCard = ({ game, onClick }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-purple-500 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Gamepad2 className="h-8 w-8 text-purple-400 mr-3" />
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              {game.name}
            </h3>
            <p className="text-sm text-gray-400">{game.entryCount} entr{game.entryCount === 1 ? 'y' : 'ies'}</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(game.lastEntry.timestamp)}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-400 mb-1">Next up:</p>
          <p className="text-white font-medium">{game.lastEntry.nextThing}</p>
        </div>

        {game.lastEntry.inProgressActivities && game.lastEntry.inProgressActivities.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-1">In Progress:</p>
            <p className="text-gray-300 text-sm">
              {game.lastEntry.inProgressActivities.slice(0, 2).join(', ')}
              {game.lastEntry.inProgressActivities.length > 2 && '...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const NewEntryForm = ({ onSave, onCancel, loading, setLoading }) => {
  const [formData, setFormData] = useState({
    gameName: '',
    lastThing: '',
    nextThing: '',
    inProgressActivities: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    setLoading(true);

    const newErrors = {};
    if (!formData.gameName.trim()) newErrors.gameName = 'Game name is required';
    if (!formData.nextThing.trim()) newErrors.nextThing = 'Next thing to do is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const activities = formData.inProgressActivities
      .split('\n')
      .map(activity => activity.trim())
      .filter(activity => activity.length > 0);

    const entry = {
      gameName: formData.gameName.trim(),
      lastThing: formData.lastThing.trim(),
      nextThing: formData.nextThing.trim(),
      inProgressActivities: activities
    };

    await new Promise(resolve => setTimeout(resolve, 500));

    onSave(entry);
    setLoading(false);
    onCancel();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">New Quest Entry</h1>
          <p className="text-gray-400 mt-2">What are you playing and what's next?</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Gamepad2 className="inline h-4 w-4 mr-2 text-purple-400" />
                What game are you playing?
              </label>
              <input
                type="text"
                value={formData.gameName}
                onChange={(e) => handleChange('gameName', e.target.value)}
                placeholder="e.g., Elden Ring, The Legend of Zelda: BOTW"
                className={`w-full px-4 py-3 bg-gray-700 border ${errors.gameName ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.gameName && <p className="text-red-400 text-sm mt-1">{errors.gameName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <BookOpen className="inline h-4 w-4 mr-2 text-blue-400" />
                What did you last do? (Optional)
              </label>
              <textarea
                value={formData.lastThing}
                onChange={(e) => handleChange('lastThing', e.target.value)}
                placeholder="e.g., Defeated the Tree Sentinel boss, explored Limgrave..."
                rows="3"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <ArrowRight className="inline h-4 w-4 mr-2 text-green-400" />
                What's next on your agenda? *
              </label>
              <textarea
                value={formData.nextThing}
                onChange={(e) => handleChange('nextThing', e.target.value)}
                placeholder="e.g., Head to Stormgate Castle, level up at the campfire..."
                rows="3"
                className={`w-full px-4 py-3 bg-gray-700 border ${errors.nextThing ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none`}
              />
              {errors.nextThing && <p className="text-red-400 text-sm mt-1">{errors.nextThing}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <ListChecks className="inline h-4 w-4 mr-2 text-yellow-400" />
                Any ongoing quests or activities? (Optional)
              </label>
              <textarea
                value={formData.inProgressActivities}
                onChange={(e) => handleChange('inProgressActivities', e.target.value)}
                placeholder="One per line:
Collect 10 wolf pelts
Find the missing villager
Upgrade sword at blacksmith"
                rows="4"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameDetails = ({ game, entries, onBack }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
          <div className="flex items-center mb-4">
            <Gamepad2 className="h-8 w-8 text-purple-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">{game.name}</h1>
          </div>
          <p className="text-gray-400">{entries.length} entr{entries.length === 1 ? 'y' : 'ies'} logged</p>
        </div>

        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(entry.timestamp)}
                </div>
              </div>

              <div className="space-y-4">
                {entry.lastThing && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Last completed:
                    </h3>
                    <p className="text-gray-300 bg-gray-700 p-3 rounded-lg">{entry.lastThing}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-2 flex items-center">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Next up:
                  </h3>
                  <p className="text-white bg-gray-700 p-3 rounded-lg font-medium">{entry.nextThing}</p>
                </div>

                {entry.inProgressActivities && entry.inProgressActivities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center">
                      <ListChecks className="h-5 w-5 mr-2" />
                      In Progress:
                    </h3>
                    <ul className="bg-gray-700 p-3 rounded-lg space-y-2">
                      {entry.inProgressActivities.map((activity, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="text-yellow-400 mr-2">•</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestlogApp;