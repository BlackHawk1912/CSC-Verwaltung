import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { X, Plus, Users, Package, TrendingUp, Settings, Home, User, Leaf, Printer, Download, Calendar } from 'lucide-react';

// Types
interface Strain {
  id: string;
  name: string;
  image: string;
  stockAmount: number;
  thcPercent: number;
  cbdPercent: number;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  floweringTime: string;
  growthDuration: string;
  description: string;
}

interface TodaysDispensing {
  id: string;
  strain: string;
  amount: number;
  over21: boolean;
  gender: 'M' | 'W' | 'D';
  time: string;
}

// Mock Data
const strains: Strain[] = [
  {
    id: '1',
    name: 'Purple Haze',
    image: '/api/placeholder/80/80',
    stockAmount: 125.75,
    thcPercent: 18.5,
    cbdPercent: 0.3,
    type: 'Sativa',
    floweringTime: '8-9 Wochen',
    growthDuration: '10-12 Wochen',
    description: 'Klassische Sativa-dominante Sorte mit euphorischer Wirkung'
  },
  {
    id: '2',
    name: 'OG Kush',
    image: '/api/placeholder/80/80',
    stockAmount: 89.25,
    thcPercent: 22.1,
    cbdPercent: 0.1,
    type: 'Hybrid',
    floweringTime: '7-8 Wochen',
    growthDuration: '9-11 Wochen',
    description: 'Beliebte Hybrid-Sorte mit entspannender Wirkung'
  },
  {
    id: '3',
    name: 'Northern Lights',
    image: '/api/placeholder/80/80',
    stockAmount: 156.50,
    thcPercent: 16.8,
    cbdPercent: 0.2,
    type: 'Indica',
    floweringTime: '6-8 Wochen',
    growthDuration: '8-10 Wochen',
    description: 'Reine Indica mit beruhigender und schmerzlindernder Wirkung'
  }
];

const todaysDispensingData: TodaysDispensing[] = [
  { id: '1', strain: 'Purple Haze', amount: 3.50, over21: true, gender: 'M', time: '09:15' },
  { id: '2', strain: 'OG Kush', amount: 2.00, over21: false, gender: 'W', time: '10:32' },
  { id: '3', strain: 'Northern Lights', amount: 5.00, over21: true, gender: 'D', time: '11:45' },
  { id: '4', strain: 'Purple Haze', amount: 1.75, over21: true, gender: 'W', time: '14:20' },
  { id: '5', strain: 'OG Kush', amount: 4.25, over21: false, gender: 'M', time: '15:55' }
];

const genderData = [
  { name: 'Männlich', value: 45, color: '#6B8E23' },
  { name: 'Weiblich', value: 42, color: '#8FBC8F' },
  { name: 'Divers', value: 13, color: '#F5F5DC' }
];

const weekdayData = [
  { day: 'Montag', amount: 24.5 },
  { day: 'Dienstag', amount: 31.2 },
  { day: 'Mittwoch', amount: 28.8 },
  { day: 'Donnerstag', amount: 35.1 },
  { day: 'Freitag', amount: 42.3 },
  { day: 'Samstag', amount: 38.7 },
  { day: 'Sonntag', amount: 22.1 }
];

const timelineData = [
  { month: 'Jan', total: 245, over21: 180, under21: 65 },
  { month: 'Feb', total: 289, over21: 205, under21: 84 },
  { month: 'Mär', total: 312, over21: 225, under21: 87 },
  { month: 'Apr', total: 298, over21: 215, under21: 83 },
  { month: 'Mai', total: 356, over21: 265, under21: 91 },
  { month: 'Jun', total: 378, over21: 280, under21: 98 }
];

const CannabisSocialClubApp: React.FC = () => {
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedStrain, setSelectedStrain] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memberNumber, setMemberNumber] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [chartType, setChartType] = useState<string>('age');

  const handleDispenseSave = () => {
    // API call would go here
    console.log('Dispensing:', { selectedStrain, amount, memberNumber });
    setShowDispenseModal(false);
    setSelectedStrain('');
    setAmount('');
    setMemberNumber('');
  };

  const StrainCard: React.FC<{ strain: Strain; onSelect: () => void; isSelected: boolean }> = ({ strain, onSelect, isSelected }) => (
    <div 
      className={`card h-100 border-0 shadow-sm strain-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ 
        cursor: 'pointer',
        background: isSelected ? 'rgba(107, 142, 35, 0.1)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: isSelected ? '2px solid #6B8E23 !important' : '1px solid rgba(107, 142, 35, 0.2) !important'
      }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-start mb-3">
          <img 
            src={strain.image} 
            alt={strain.name}
            className="rounded me-3"
            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
          />
          <div className="flex-grow-1">
            <h6 className="card-title mb-1" style={{ color: '#6B8E23', fontWeight: 600 }}>
              {strain.name}
            </h6>
            <small className="text-muted">{strain.type}</small>
            <div className="mt-1">
              <small className="fw-bold" style={{ color: '#6B8E23' }}>
                Vorrat: {strain.stockAmount}g
              </small>
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">THC: {strain.thcPercent}%</small>
            <small className="text-muted">CBD: {strain.cbdPercent}%</small>
          </div>
          <div className="progress mb-1" style={{ height: '8px' }}>
            <div 
              className="progress-bar"
              style={{ 
                width: `${(strain.thcPercent / 25) * 100}%`,
                backgroundColor: '#6B8E23'
              }}
            />
          </div>
          <div className="progress" style={{ height: '4px' }}>
            <div 
              className="progress-bar"
              style={{ 
                width: `${(strain.cbdPercent / 5) * 100}%`,
                backgroundColor: '#8FBC8F'
              }}
            />
          </div>
        </div>
        
        <div className="small text-muted">
          <div>Blütezeit: {strain.floweringTime}</div>
          <div>Wuchsdauer: {strain.growthDuration}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex vh-100" style={{ backgroundColor: '#F5F5DC' }}>
      <style>
        {`
          .glass-effect {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .sidebar-glass {
            background: rgba(107, 142, 35, 0.1);
            backdrop-filter: blur(15px);
            border-right: 1px solid rgba(107, 142, 35, 0.2);
          }
          
          .nav-item {
            transition: all 0.3s ease;
            border-radius: 12px;
            margin: 4px 0;
          }
          
          .nav-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(5px);
          }
          
          .nav-item.active {
            background: rgba(107, 142, 35, 0.3);
            color: #6B8E23 !important;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #6B8E23, #8FBC8F);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(107, 142, 35, 0.3);
            transition: all 0.3s ease;
          }
          
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(107, 142, 35, 0.4);
            background: linear-gradient(135deg, #8FBC8F, #6B8E23);
          }
          
          .card {
            border-radius: 16px;
            transition: all 0.3s ease;
          }
          
          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }
          
          .strain-card.selected {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(107, 142, 35, 0.2);
          }
          
          .modal-backdrop {
            backdrop-filter: blur(5px);
          }
          
          .modal-content {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border: none;
            border-radius: 20px;
          }
          
          .progress {
            border-radius: 10px;
            background-color: rgba(107, 142, 35, 0.1);
          }
          
          .form-control {
            border-radius: 12px;
            border: 1px solid rgba(107, 142, 35, 0.3);
            background: rgba(255, 255, 255, 0.9);
          }
          
          .form-control:focus {
            border-color: #6B8E23;
            box-shadow: 0 0 0 0.2rem rgba(107, 142, 35, 0.25);
          }
          
          .table {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 12px;
          }
          
          .age-progress {
            height: 30px;
            border-radius: 15px;
            background: rgba(107, 142, 35, 0.1);
            overflow: hidden;
            position: relative;
          }
          
          .age-progress .progress-bar {
            border-radius: 0;
          }
        `}
      </style>

      {/* Sidebar Navigation */}
      <div className="sidebar-glass" style={{ width: '280px', minHeight: '100vh' }}>
        <div className="p-4">
          <div className="d-flex align-items-center mb-4">
            <Leaf size={32} color="#6B8E23" className="me-2" />
            <h4 className="mb-0 fw-bold" style={{ color: '#6B8E23' }}>
              CSC Manager
            </h4>
          </div>
          
          <nav className="nav flex-column">
            <div className="nav-item p-3 d-flex align-items-center text-muted">
              <Home size={20} className="me-3" />
              Startseite
            </div>
            <div className="nav-item p-3 d-flex align-items-center text-muted">
              <User size={20} className="me-3" />
              Benutzer-Login
            </div>
            <div className="nav-item p-3 d-flex align-items-center text-muted">
              <Users size={20} className="me-3" />
              Mitgliedsmanagement
            </div>
            <div className="nav-item p-3 d-flex align-items-center text-muted">
              <Package size={20} className="me-3" />
              Vorratsmanagement
            </div>
            <div className="nav-item p-3 d-flex align-items-center text-muted">
              <Leaf size={20} className="me-3" />
              Wachstumsmanagement
            </div>
            <div className="nav-item active p-3 d-flex align-items-center fw-bold">
              <TrendingUp size={20} className="me-3" />
              Statistik
            </div>
            <div className="nav-item p-3 d-flex align-items-center text-muted">
              <Settings size={20} className="me-3" />
              Einstellungen
            </div>
            
            <div className="mt-4">
              <button 
                className="btn btn-primary w-100 py-3 fw-bold"
                onClick={() => setShowDispenseModal(true)}
              >
                <Plus size={20} className="me-2" />
                Neue Ausgabe
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold" style={{ color: '#6B8E23' }}>Statistik Dashboard</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-success">
                <Download size={16} className="me-2" />
                Export
              </button>
              <button className="btn btn-outline-success">
                <Printer size={16} className="me-2" />
                Drucken
              </button>
            </div>
          </div>

          <div className="row g-4">
            {/* Gender Distribution Pie Chart */}
            <div className="col-md-6">
              <div className="card glass-effect h-100">
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="card-title fw-bold" style={{ color: '#6B8E23' }}>
                    Ausgabe nach Geschlecht
                  </h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Age Distribution */}
            <div className="col-md-6">
              <div className="card glass-effect h-100">
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="card-title fw-bold" style={{ color: '#6B8E23' }}>
                    Ausgabe nach Alter
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Über 21 Jahre</span>
                      <span className="fw-bold">73%</span>
                    </div>
                    <div className="age-progress">
                      <div 
                        className="progress-bar h-100"
                        style={{ width: '73%', backgroundColor: '#6B8E23' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Unter 21 Jahre</span>
                      <span className="fw-bold">27%</span>
                    </div>
                    <div className="age-progress">
                      <div 
                        className="progress-bar h-100"
                        style={{ width: '27%', backgroundColor: '#8FBC8F' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="col-12">
              <div className="card glass-effect">
                <div className="card-header bg-transparent border-0 pb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title fw-bold" style={{ color: '#6B8E23' }}>
                      Ausgabeverlauf
                    </h5>
                    <div className="d-flex gap-2">
                      <select 
                        className="form-select form-select-sm"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={{ width: '140px' }}
                      >
                        <option value="3months">3 Monate</option>
                        <option value="6months">6 Monate</option>
                        <option value="1year">1 Jahr</option>
                      </select>
                      <select 
                        className="form-select form-select-sm"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        style={{ width: '120px' }}
                      >
                        <option value="age">Nach Alter</option>
                        <option value="gender">Nach Geschlecht</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 142, 35, 0.2)" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#6B8E23" 
                        strokeWidth={3}
                        name="Gesamt (g)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="over21" 
                        stroke="#8FBC8F" 
                        strokeWidth={2}
                        name="Über 21 (g)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="under21" 
                        stroke="#F5F5DC" 
                        strokeWidth={2}
                        name="Unter 21 (g)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Weekday Bar Chart */}
            <div className="col-md-6">
              <div className="card glass-effect h-100">
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="card-title fw-bold" style={{ color: '#6B8E23' }}>
                    Durchschnitt pro Wochentag
                  </h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weekdayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 142, 35, 0.2)" />
                      <XAxis dataKey="day" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px'
                        }}
                        formatter={(value) => [`${value}g`, 'Durchschnitt']}
                      />
                      <Bar dataKey="amount" fill="#6B8E23" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Today's Dispensings Table */}
            <div className="col-md-6">
              <div className="card glass-effect h-100">
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="card-title fw-bold" style={{ color: '#6B8E23' }}>
                    Heutige Ausgaben
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr style={{ color: '#6B8E23' }}>
                          <th>Zeit</th>
                          <th>Sorte</th>
                          <th>Menge (g)</th>
                          <th>Ü21</th>
                          <th>Geschlecht</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todaysDispensingData.map((item) => (
                          <tr key={item.id}>
                            <td className="fw-bold">{item.time}</td>
                            <td>{item.strain}</td>
                            <td>{item.amount}</td>
                            <td>
                              <span className={`badge ${item.over21 ? 'bg-success' : 'bg-warning'}`}>
                                {item.over21 ? 'Ja' : 'Nein'}
                              </span>
                            </td>
                            <td>{item.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispensing Modal */}
      {showDispenseModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold" style={{ color: '#6B8E23' }}>
                  Neue Ausgabe
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowDispenseModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <label className="form-label fw-bold" style={{ color: '#6B8E23' }}>
                    Sorte auswählen
                  </label>
                  <div className="row g-3">
                    {strains.map((strain) => (
                      <div key={strain.id} className="col-md-4">
                        <StrainCard 
                          strain={strain}
                          onSelect={() => setSelectedStrain(strain.id)}
                          isSelected={selectedStrain === strain.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ color: '#6B8E23' }}>
                      Menge (g)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ color: '#6B8E23' }}>
                      Mitgliedsnummer
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={memberNumber}
                      onChange={(e) => setMemberNumber(e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDispenseModal(false)}
                >
                  Abbrechen
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleDispenseSave}
                  disabled={!selectedStrain || !amount || !memberNumber}
                >
                  Ausgabe speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CannabisSocialClubApp;