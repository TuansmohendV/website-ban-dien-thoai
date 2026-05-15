import TradeInDevice from '../models/TradeInDevice.js';

export const getTradeInBrands = async (req, res) => {
  try {
    const brands = await TradeInDevice.distinct('brand', { isActive: true });
    res.json({ data: brands });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTradeInModels = async (req, res) => {
  const { brand } = req.params;
  try {
    const models = await TradeInDevice.find({ brand, isActive: true });
    res.json({ data: models });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const calculateValuation = async (req, res) => {
  const { deviceId, conditionAnswers } = req.body;
  
  try {
    const device = await TradeInDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    let multiplier = 1.0;
    
    // Simple valuation logic based on condition answers
    // answers: { screen: 'good'|'scratched'|'broken', body: ..., battery: ... }
    if (conditionAnswers.screen === 'scratched') multiplier -= 0.15;
    if (conditionAnswers.screen === 'broken') multiplier -= 0.4;
    
    if (conditionAnswers.body === 'scratched') multiplier -= 0.05;
    if (conditionAnswers.body === 'dented') multiplier -= 0.15;
    
    if (conditionAnswers.battery === 'below80') multiplier -= 0.1;
    
    const valuation = Math.round(device.basePrice * multiplier);

    res.json({ 
      data: {
        deviceId: device._id,
        brand: device.brand,
        model: device.model,
        basePrice: device.basePrice,
        valuation: Math.max(0, valuation),
        multiplier,
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin only
export const addTradeInDevice = async (req, res) => {
    try {
        const device = new TradeInDevice(req.body);
        await device.save();
        res.status(201).json({ data: device });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
