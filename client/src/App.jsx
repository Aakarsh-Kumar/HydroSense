import React, { useState } from 'react';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Droplet, Moon, Sun, AlertTriangle, CheckCircle, Power, Activity} from 'lucide-react';

const generatePastUsageData = () => {
  const days = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  return days.map((day, index) => {
    const baseValue = 10 + Math.random() * 5;
    return {
      name: index % 2 === 0 ? day : "",
      usage: Math.round(baseValue),
      average: 11,
    };
  });
};


const generateFutureUsageData = () => {
  const nextWeek = ['Next Mon', 'Next Tue', 'Next Wed', 'Next Thu', 'Next Fri', 'Next Sat', 'Next Sun'];
  return nextWeek.map((day, index) => {
    const baseValue = 130 + Math.random() * 70;
    const prediction = Math.round(baseValue);
    return {
      name: day,
      prediction: prediction,
      threshold: prediction > 170 ? prediction : null,
    };
  });
};

const useFlowRate = (isPumpOn, hasLeak) => {
  const [flowRate, setFlowRate] = useState(0);
  const [totalUsage, setTotalUsage] = useState(1250);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isPumpOn) {
        let newRate = 5 + Math.random() * 3;
        if (hasLeak) {
          newRate += 8 + Math.random() * 4;
        }
        
        setFlowRate(parseFloat(newRate.toFixed(1)));
        setTotalUsage(prev => parseFloat((prev + newRate/60).toFixed(1)));
      } else {
        setFlowRate(0);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPumpOn, hasLeak]);
  
  return { flowRate, totalUsage };
};

const WaterDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [hasLeak, setHasLeak] = useState(false);
  const [showLeakAlert, setShowLeakAlert] = useState(false);
  const [pastUsageData, setPastUsageData] = useState(generatePastUsageData());
  const [futureUsageData, setFutureUsageData] = useState(generateFutureUsageData());
  const [leakProbability, setLeakProbability] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const { flowRate, totalUsage } = useFlowRate(isPumpOn, hasLeak);
  
  React.useEffect(() => {
    const leakDetectionInterval = setInterval(() => {
      if (isPumpOn) {
        let probability = Math.random() * 20;
        
        if (hasLeak) {
          probability += 60 + Math.random() * 20;
        }
        
        setLeakProbability(Math.min(100, Math.round(probability)));
        if (probability > 70 && !showLeakAlert) {
          setShowLeakAlert(true);
          showNotificationMessage(' Potential leak detected! Check system or shut off pump.', 6000);
        } else if (probability < 30 && showLeakAlert) {
          setShowLeakAlert(false);
        }
      } else {
        setLeakProbability(0);
        if (showLeakAlert) setShowLeakAlert(false);
      }
    }, 3000);
    
    return () => clearInterval(leakDetectionInterval);
  }, [isPumpOn, hasLeak, showLeakAlert]);
  
  const showNotificationMessage = (message, duration = 3000) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), duration);
  };

  const togglePump = () => {
    const newState = !isPumpOn;
    setIsPumpOn(newState);
    showNotificationMessage(`Pump turned ${newState ? 'ON' : 'OFF'}`);
  };
  
  const toggleLeak = () => {
    setHasLeak(!hasLeak);
  };

  const emergencyShutOff = () => {
    setIsPumpOn(false);
    setShowLeakAlert(false);
    showNotificationMessage('Emergency shut-off activated. Pump is now OFF.');
  };

  const calculateFlowPercentage = () => {
    return Math.min(100, (flowRate / 15) * 100);
  };
  
  const refreshPastUsageData = () => {
    setPastUsageData(generatePastUsageData());
  };
  
  const refreshFutureUsageData = () => {
    setFutureUsageData(generateFutureUsageData());
  };

  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <nav className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md backdrop-blur-lg bg-opacity-90`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Droplet className="text-blue-500" size={28} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              HydroSense
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-16 right-4 bg-black bg-opacity-80 text-white py-2 px-4 rounded-lg shadow-lg z-50"
                >
                  {notificationMessage}
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>
        </div>
      </nav>
      

      <div className="container mx-auto p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white'} backdrop-blur-lg`}
          >

            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="mr-2 text-blue-500" />
                Live Water Flow
              </h2>
              
              <div className="flex justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Current Flow</p>
                  <motion.p 
                    key={flowRate}
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-3xl font-bold"
                  >
                    {flowRate} <span className="text-lg font-normal">L/min</span>
                  </motion.p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Usage per hour</p>
                  <motion.p 
                    key={totalUsage}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-bold"
                  >
                    {totalUsage} <span className="text-lg font-normal">L</span>
                  </motion.p>
                </div>
              </div>
              
              <div className="relative h-36 flex items-center justify-center mb-2">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={darkMode ? "#374151" : "#E5E7EB"}
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#blue-gradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - calculateFlowPercentage() / 100)}`}
                    initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - calculateFlowPercentage() / 100)}` }}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <motion.span 
                    key={flowRate}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-bold"
                  >
                    {calculateFlowPercentage().toFixed(0)}%
                  </motion.span>
                  <span className="text-xs text-gray-500">Possible Leak</span>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                Expected Flow: 0-10 L/min
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white'} backdrop-blur-lg`}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Power className="mr-2 text-blue-500" />
                Pump Control
              </h2>
              
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-teal-50 dark:from-blue-900 dark:to-teal-900">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePump}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
                      isPumpOn 
                        ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Power size={32} />
                  </motion.button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={isPumpOn ? { 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7] 
                      } : { scale: 1, opacity: 0.5 }}
                      transition={isPumpOn ? { 
                        repeat: Infinity,
                        duration: 1.5 
                      } : {}}
                      className={`w-3 h-3 rounded-full mr-2 ${
                        isPumpOn ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <span className="font-medium">
                      {isPumpOn ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-center items-center mt-4">
                  <button 
                    onClick={toggleLeak}
                    className="text-xs px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {hasLeak ? "Fix Simulated Leak" : "Simulate Leak"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white'} backdrop-blur-lg`}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className={`mr-2 ${showLeakAlert ? 'text-red-500' : 'text-blue-500'}`} />
                Leak Detection
              </h2>
              
              <AnimatePresence mode="wait">
                {showLeakAlert ? (
                  <motion.div
                    key="leak-alert"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-100 dark:bg-red-900 dark:bg-opacity-30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-start">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 1 
                        }}
                      >
                        <AlertTriangle className="text-red-500 mr-3" size={24} />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-red-700 dark:text-red-400">Potential Leak Detected!</h3>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                          Abnormal flow rate detected. Please check system or take action.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={emergencyShutOff}
                          className="mt-3 bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-sm"
                        >
                          Emergency Shut Off
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-leak"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-100 dark:border-green-800 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center">
                      <CheckCircle className="text-green-500 mr-3" size={24} />
                      <div>
                        <h3 className="font-bold text-green-700 dark:text-green-400">No Leaks Detected</h3>
                        <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                          System is operating normally
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-14">
                <h3 className="text-sm font-medium mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-500 mb-1">Last analysis: Just now</p>
                <p className="text-sm">
                  {isPumpOn ? (
                    leakProbability > 70 ? 
                    "Abnormal flow pattern detected - immediate inspection recommended." :
                    leakProbability > 30 ?
                    "Flow patterns show some irregularities - monitoring closely." :
                    "Water flow pattern is within normal parameters."
                  ) : "Pump is currently off. No flow to analyze."}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`col-span-1 md:col-span-3 rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white'} backdrop-blur-lg`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Usage History</h2>
                <button
                  onClick={refreshPastUsageData}
                  className="text-xs px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Refresh Data
                </button>
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pastUsageData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                    <XAxis dataKey="name" stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                    <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                        borderColor: darkMode ? "#374151" : "#E5E7EB",
                        color: darkMode ? "#F9FAFB" : "#111827"
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="usage" 
                      name="Water Usage (L)" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6, stroke: "#1E40AF", strokeWidth: 2 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      name="Daily Average" 
                      stroke="#9CA3AF" 
                      strokeDasharray="3 3" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-2">
                Past 24 hours water consumption
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`col-span-1 lg:col-span-3 rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white'} backdrop-blur-lg`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">AI Predictions & Leak Prevention</h2>
                <button
                  onClick={refreshFutureUsageData}
                  className="text-xs px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Regenerate Predictions
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={futureUsageData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                      <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                          borderColor: darkMode ? "#374151" : "#E5E7EB",
                          color: darkMode ? "#F9FAFB" : "#111827"
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="prediction" 
                        name="Predicted Usage (L)" 
                        fill="url(#blue-gradient-bar)" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="threshold" 
                        name="High Usage Alert" 
                        fill="#EF4444" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <defs>
                        <linearGradient id="blue-gradient-bar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [showDefaultApp, setShowDefaultApp] = useState(false);
  
  return (
    <div className="App">
        <div>
          <WaterDashboard />
        </div>
    </div>
  );
}

export default App;