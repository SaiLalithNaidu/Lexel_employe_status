import { useState, useEffect } from "react";
import { HiTrash, HiPencil } from "react-icons/hi";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../shared/Avatar";
import LoadingState from "../shared/LoadingState";
import toast from "react-hot-toast";

export default function TaskComments({ taskId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/tasks/${taskId}/comments`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const res = await api.post(`/api/tasks/${taskId}/comments`, {
        content: newComment,
      });
      setComments([...comments, res.data.comment]);
      setNewComment("");
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/api/tasks/${taskId}/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="rounded-lg bg-white p-4 shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a comment
        </label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your comment... Use @ to mention someone"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          Comment
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <LoadingState />
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className="rounded-lg bg-white p-4 shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar user={comment.userId} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {comment.userId?.firstName} {comment.userId?.lastName}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    {/* Mentions */}
                    {comment.mentions?.length > 0 && (
                      <p className="mt-2 text-xs text-blue-600">
                        Mentioned: {comment.mentions.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {user?._id === comment.userId?._id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Edited indicator */}
              {comment.edited && (
                <p className="mt-2 text-xs text-gray-500">
                  Edited {new Date(comment.editedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
