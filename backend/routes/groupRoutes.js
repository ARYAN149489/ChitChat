const express = require('express');
const Group = require('../models/GroupModel');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const groupRouter = express.Router();

// Create a new group
groupRouter.post('/', protect, isAdmin, async (req, resp) => {
    try {
        const { name, description } = req.body;

        const groupExists = await Group.findOne({ name });
        if (groupExists) {
            return resp.status(400).json({ message: "Group with this name already exists" });
        }

        const group = await Group.create({
            name,
            description,
            admin: req.user._id,
            members: [req.user._id],
        })
        const populatedGroup = await Group.findById(group._id)
            .populate("admin", "username email")
            .populate("members", "username email");
        return resp.status(201).json({ populatedGroup });
    } catch (error) {
        console.log(error);
        return resp.status(400).json({ message: error.message });
    }
})

// get all groups
groupRouter.get('/', protect, async (req, resp) => {
    try {
        const groups = await Group.find()
            .populate("admin", "username email")
            .populate("members", "username email");
        resp.json(groups);
    } catch (error) {
        resp.status(400).json({ message: error.message })
    }
})

// Join group
groupRouter.post('/:groupId/join', protect, async (req, resp) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return resp.status(404).json({ message: "Group not found" });
        }
        if(group.members.includes(req.user._id)){
            return resp.status(400).json({message: "Already a member of group"});
        }
        group.members.push(req.user._id);
        await group.save();
        resp.json({message: "Successfullt joined the group"});
    } catch (error) {
        resp.status(400).json({message: error.message});
    }
})

// leave group
groupRouter.post('/:groupId/leave', protect, async(req, resp)=>{
    try {
        const group = await Group.findById(req.params.groupId);
        if(!group){
            return resp.status(404).json({message: 'Group not found'});
        }
        if(!group.members.includes(req.user._id)){
            return resp.status(400).json({message: "Not a member of group"});
        }
        
        group.members = group.members.filter(memberId => memberId.toString() !== req.user._id.toString());
        await group.save();
        return resp.json({message: "Successfully left the group"});
    } catch (error) {
        return resp.status(400).json({message: error.message});
    }
})
module.exports = groupRouter;