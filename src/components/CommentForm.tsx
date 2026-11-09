import { useState, type FormEvent } from "react";

type CommentFormProps = {
  onAddComment: (text: string) => void;
};

export default function CommentForm({ onAddComment }: CommentFormProps) {
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();

    // whitespace only counts as empty
    if (!trimmed) {
      return;
    }

    onAddComment(trimmed);
    setText("");
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor="comment">Add comment</label>
      <textarea
        id="comment"
        name="comment"
        required
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
