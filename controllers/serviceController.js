import Service from '../models/Service.js';
import User from '../models/User.js';

// @desc    Create service
// @route   POST /api/service
// @access  Private
export const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const serviceData = req.body;

    const service = await Service.create({
      ...serviceData,
      userId
    });

    // Update user's service details status
    await User.update({ serviceDetailsCompleted: true }, { where: { id: userId } });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating service'
    });
  }
};

// @desc    Get all services for a user
// @route   GET /api/service
// @access  Private
export const getServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const services = await Service.findAll({ 
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services'
    });
  }
};

// @desc    Get single service
// @route   GET /api/service/:id
// @access  Private
export const getService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user owns this service
    if (service.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this service'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service'
    });
  }
};

// @desc    Update service
// @route   PUT /api/service/:id
// @access  Private
export const updateService = async (req, res) => {
  try {
    console.log('Update service request:', { id: req.params.id, body: req.body, userId: req.user.id });
    
    let service = await Service.findByPk(req.params.id);

    if (!service) {
      console.log('Service not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user owns this service
    if (service.user_id.toString() !== req.user.id.toString()) {
      console.log('User not authorized:', { serviceUserId: service.user_id, reqUserId: req.user.id, types: { serviceUserIdType: typeof service.user_id, reqUserIdType: typeof req.user.id } });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    console.log('Updating service with data:', req.body);
    await service.update(req.body);
    console.log('Service updated successfully');

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating service'
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/service/:id
// @access  Private
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user owns this service
    if (service.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await service.destroy();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting service'
    });
  }
};

// @desc    Bulk create/update services
// @route   POST /api/service/bulk
// @access  Private
export const bulkCreateServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { services } = req.body;

    if (!Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: 'Services must be an array'
      });
    }

    // Add userId to all services
    const servicesWithUserId = services.map(service => ({
      ...service,
      userId
    }));

    // Delete all existing services for this user
    await Service.destroy({ where: { userId } });

    // Create new services
    const createdServices = await Service.bulkCreate(servicesWithUserId);

    // Update user's service details status
    await User.update({ serviceDetailsCompleted: true }, { where: { id: userId } });

    res.status(201).json({
      success: true,
      count: createdServices.length,
      data: createdServices
    });
  } catch (error) {
    console.error('Bulk create services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating services'
    });
  }
};

// @desc    Delete all services for a user
// @route   DELETE /api/service/all
// @access  Private
export const deleteAllServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedCount = await Service.destroy({ where: { userId } });

    res.json({
      success: true,
      message: `Deleted ${deletedCount} services successfully`
    });
  } catch (error) {
    console.error('Delete all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting all services'
    });
  }
};

