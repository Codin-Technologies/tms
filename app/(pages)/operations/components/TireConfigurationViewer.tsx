import React, { useState } from 'react';
import './VehicleAxleConfigurator.css';

// Component to render a single axle group
const AxleGroup = ({ type, isDriven }) => {
  // Simple visual representation of wheels
  const Wheel = ({ isDriven }) => (
    <div className={`wheel ${isDriven ? 'driven' : ''}`}></div>
  );

  return (
    <div className="axle-group">
      {/* Assuming standard dual wheels per end for heavy vehicles as an example */}
      <Wheel isDriven={isDriven} />
      <div className="axle-line"></div>
      <Wheel isDriven={isDriven} />
    </div>
  );
};

// Main Configurator Component
const VehicleAxleConfigurator = () => {
  const [configuration, setConfiguration] = useState('4x2');

  // Define axle properties for different configurations (Total Axles x Driven Axles)
  const configs = {
    '4x2': { total: 2, driven: 1 },
    '6x4': { total: 3, driven: 2 },
    '8x4': { total: 4, driven: 2 },
  };

  const currentConfig = configs[configuration];
  const axles = [];
  // Create an array representing each axle
  for (let i = 0; i < currentConfig.total; i++) {
    // Determine if the axle is driven (rear-most axles are typically driven)
    const isDriven = i >= currentConfig.total - currentConfig.driven;
    axles.push({ id: i, isDriven });
  }

  return (
    <div className="configurator-container">
      <h2>Vehicle Axle Configuration Selector</h2>
      
      <div className="controls">
        <label htmlFor="config-select">Select Configuration: </label>
        <select
          id="config-select"
          value={configuration}
          onChange={(e) => setConfiguration(e.target.value)}
        >
          {Object.keys(configs).map((config) => (
            <option key={config} value={config}>
              {config} ({configs[config].total} axles, {configs[config].driven} driven)
            </option>
          ))}
        </select>
      </div>

      {/* Visual Representation Area */}
      <div className="vehicle-diagram">
        <div className="truck-body">
          {axles.map((axle) => (
            <AxleGroup key={axle.id} isDriven={axle.isDriven} />
          ))}
        </div>
      </div>
      
      <p>Current selection: **{configuration}**</p>
    </div>
  );
};

export default VehicleAxleConfigurator;
