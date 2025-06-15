import express from 'express';
import Todo from '../models/Todo.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Lấy tất cả todos của người dùng
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo todo mới
router.post('/', auth, async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    userId: req.user.userId
  });
  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật todo
router.put('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo không tìm thấy hoặc không thuộc về bạn' });
    }
    if (req.body.title) todo.title = req.body.title;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo không tìm thấy hoặc không thuộc về bạn' });
    }
    await todo.deleteOne();
    res.json({ message: 'Todo đã xóa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;