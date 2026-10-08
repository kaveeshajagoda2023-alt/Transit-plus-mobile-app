const Ticket = require('../models/Ticket');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// In-memory fallback store when MongoDB local service is offline
let inMemoryTickets = [];

// @desc    Create new digital pass / ticket
// @route   POST /api/tickets
// @access  Public
const createTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      userId,
      passengerName,
      route,
      boardingPoint,
      destination,
      travelDate,
      travelTime,
      fare,
      paymentMethod,
    } = req.body;

    const ticketId = `TKT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const normalizedFare = Number(fare);

    const qrPayload = JSON.stringify({
      ticketId,
      passengerId: userId,
      route,
      from: boardingPoint,
      to: destination,
      travelDate,
      travelTime,
      fare: normalizedFare,
      status: 'Active',
    });

    const ticketPayload = {
      ticketId,
      userId,
      passengerName: passengerName || 'Transit Passenger',
      route,
      boardingPoint,
      destination,
      travelDate,
      travelTime,
      fare: normalizedFare,
      paymentMethod: paymentMethod || 'Simulated Pay',
      paymentStatus: 'Completed',
      ticketStatus: 'Active',
      qrData: qrPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      const ticket = new Ticket(ticketPayload);
      const savedTicket = await ticket.save();
      return res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        ticket: savedTicket,
      });
    } else {
      inMemoryTickets.unshift(ticketPayload);
      return res.status(201).json({
        success: true,
        message: 'Ticket created successfully (In-Memory)',
        ticket: ticketPayload,
      });
    }
  } catch (error) {
    console.error('Error creating ticket:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error creating ticket',
      error: error.message,
    });
  }
};

// @desc    Get passenger ticket history by userId
// @route   GET /api/tickets/user/:userId
// @access  Public
const getUserTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: tickets.length,
        tickets,
      });
    } else {
      const userTickets = inMemoryTickets.filter((t) => t.userId === userId);
      return res.status(200).json({
        success: true,
        count: userTickets.length,
        tickets: userTickets,
      });
    }
  } catch (error) {
    console.error('Error fetching passenger tickets:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user tickets',
      error: error.message,
    });
  }
};

// @desc    Get single ticket by ticketId or _id
// @route   GET /api/tickets/:id
// @access  Public
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      let ticket = await Ticket.findOne({ ticketId: id });
      if (!ticket && id.match(/^[0-9a-fA-F]{24}$/)) {
        ticket = await Ticket.findById(id);
      }

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      return res.status(200).json({
        success: true,
        ticket,
      });
    } else {
      const ticket = inMemoryTickets.find((t) => t.ticketId === id || t._id === id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }
      return res.status(200).json({
        success: true,
        ticket,
      });
    }
  } catch (error) {
    console.error('Error fetching ticket by ID:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching ticket details',
      error: error.message,
    });
  }
};

// @desc    Update ticket status (e.g. Active -> Used / Expired / Cancelled)
// @route   PUT /api/tickets/:id/status
// @access  Public
const updateTicketStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { ticketStatus } = req.body;

    if (mongoose.connection.readyState === 1) {
      let ticket = await Ticket.findOne({ ticketId: id });
      if (!ticket && id.match(/^[0-9a-fA-F]{24}$/)) {
        ticket = await Ticket.findById(id);
      }

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      ticket.ticketStatus = ticketStatus;

      try {
        const parsedQr = JSON.parse(ticket.qrData);
        parsedQr.status = ticketStatus;
        ticket.qrData = JSON.stringify(parsedQr);
      } catch (e) {}

      const updatedTicket = await ticket.save();

      return res.status(200).json({
        success: true,
        message: `Ticket status updated to ${ticketStatus}`,
        ticket: updatedTicket,
      });
    } else {
      const ticketIndex = inMemoryTickets.findIndex((t) => t.ticketId === id || t._id === id);
      if (ticketIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      inMemoryTickets[ticketIndex].ticketStatus = ticketStatus;
      try {
        const parsedQr = JSON.parse(inMemoryTickets[ticketIndex].qrData);
        parsedQr.status = ticketStatus;
        inMemoryTickets[ticketIndex].qrData = JSON.stringify(parsedQr);
      } catch (e) {}

      return res.status(200).json({
        success: true,
        message: `Ticket status updated to ${ticketStatus}`,
        ticket: inMemoryTickets[ticketIndex],
      });
    }
  } catch (error) {
    console.error('Error updating ticket status:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating ticket status',
      error: error.message,
    });
  }
};

// @desc    Cancel/delete ticket if permitted
// @route   DELETE /api/tickets/:id
// @access  Public
const validateQrTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId || typeof ticketId !== 'string' || ticketId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        status: 'INVALID',
        message: 'A ticket ID is required',
      });
    }

    let ticket;
    if (mongoose.connection.readyState === 1) {
      ticket = await Ticket.findOne({ ticketId: ticketId.trim() });
    } else {
      ticket = inMemoryTickets.find((item) => item.ticketId === ticketId.trim());
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        status: 'INVALID',
        message: 'Ticket not found',
      });
    }

    const status = ticket.ticketStatus || 'Active';
    if (status === 'Cancelled') {
      return res.status(200).json({
        success: false,
        status: 'CANCELLED',
        message: 'Ticket cancelled',
        ticket: { ticketId: ticket.ticketId, passengerName: ticket.passengerName },
      });
    }

    if (status === 'Used') {
      return res.status(200).json({
        success: false,
        status: 'ALREADY_USED',
        message: 'Ticket has already been used',
        ticket: { ticketId: ticket.ticketId, passengerName: ticket.passengerName },
      });
    }

    if (status === 'Expired') {
      return res.status(200).json({
        success: false,
        status: 'EXPIRED',
        message: 'Ticket has expired',
        ticket: { ticketId: ticket.ticketId, passengerName: ticket.passengerName },
      });
    }

    return res.status(200).json({
      success: true,
      status: 'VALID',
      message: 'Valid TransitPulse ticket',
      ticket: {
        ticketId: ticket.ticketId,
        passengerName: ticket.passengerName,
        route: ticket.route,
        from: ticket.boardingPoint,
        to: ticket.destination,
        travelDate: ticket.travelDate,
        travelTime: ticket.travelTime,
        fare: ticket.fare,
        status: ticket.ticketStatus,
      },
    });
  } catch (error) {
    console.error('Error validating QR ticket:', error.message);
    return res.status(500).json({
      success: false,
      status: 'INVALID',
      message: 'Unable to validate ticket',
    });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      let ticket = await Ticket.findOne({ ticketId: id });
      if (!ticket && id.match(/^[0-9a-fA-F]{24}$/)) {
        ticket = await Ticket.findById(id);
      }

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      if (ticket.ticketStatus === 'Used') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a ticket that has already been used',
        });
      }

      ticket.ticketStatus = 'Cancelled';
      await ticket.save();

      return res.status(200).json({
        success: true,
        message: 'Ticket cancelled successfully',
        ticket,
      });
    } else {
      const ticketIndex = inMemoryTickets.findIndex((t) => t.ticketId === id || t._id === id);
      if (ticketIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      if (inMemoryTickets[ticketIndex].ticketStatus === 'Used') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a ticket that has already been used',
        });
      }

      inMemoryTickets[ticketIndex].ticketStatus = 'Cancelled';
      return res.status(200).json({
        success: true,
        message: 'Ticket cancelled successfully',
        ticket: inMemoryTickets[ticketIndex],
      });
    }
  } catch (error) {
    console.error('Error cancelling ticket:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error cancelling ticket',
      error: error.message,
    });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicketById,
  updateTicketStatus,
  validateQrTicket,
  deleteTicket,
};
