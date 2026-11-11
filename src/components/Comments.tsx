import { useState, type SubmitEvent } from "react";

import type { ArtPieceComment } from "../types";

type CommentsProps = {
  comments: ArtPieceComment[];
  onEditComment: (id: string, text: string) => void;
  onDeleteComment: (id: string) => void;
};

export default function Comments({
  comments,
  onEditComment,
  onDeleteComment,
}: CommentsProps) {
  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading">Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="comments">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={(text) => onEditComment(comment.id, text)}
              onDelete={() => onDeleteComment(comment.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

type CommentItemProps = {
  comment: ArtPieceComment;
  onEdit: (text: string) => void;
  onDelete: () => void;
};

function CommentItem({ comment, onEdit, onDelete }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);

  function startEditing() {
    setDraft(comment.text);
    setIsEditing(true);
  }

  function handleSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    onEdit(trimmed);
    setIsEditing(false);
  }

  const date = (
    <time dateTime={comment.date}>
      {new Date(comment.date).toLocaleString()}
    </time>
  );

  if (isEditing) {
    return (
      <li>
        <form className="comment-form" onSubmit={handleSave}>
          <label htmlFor={`edit-${comment.id}`}>Edit comment</label>
          <textarea
            id={`edit-${comment.id}`}
            required
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          {date}
          <div>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li>
      <p>{comment.text}</p>
      {date}
      <div>
        <button type="button" onClick={startEditing}>
          Edit
        </button>
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}
