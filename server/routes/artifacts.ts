import express from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { Artifact } from '../models/Artifact';
import { z } from 'zod';

export const artifactRouter = express.Router();

const artifactSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

// Create artifact
artifactRouter.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const { title, description } = artifactSchema.parse(req.body);
    const artifact = new Artifact({
      title,
      description,
      userId: req.userId,
    });
    await artifact.save();
    res.status(201).json(artifact);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Get user's artifacts
artifactRouter.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const artifacts = await Artifact.find({
      userId: req.userId,
      isDeleted: false,
    });
    res.json(artifacts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update artifact
artifactRouter.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { title, description } = artifactSchema.parse(req.body);
    const artifact = await Artifact.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false,
    });

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    artifact.title = title;
    artifact.description = description;
    await artifact.save();

    res.json(artifact);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Soft delete artifact
artifactRouter.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const artifact = await Artifact.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false,
    });

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    artifact.isDeleted = true;
    await artifact.save();

    res.json({ message: 'Artifact deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});