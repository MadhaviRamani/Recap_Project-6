import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CommentForm from "./CommentForm";

test("shows a text field and a submit button", () => {
  render(<CommentForm onAddComment={vi.fn()} />);

  expect(screen.getByLabelText("Add comment")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
});

test("submits the trimmed text and clears the field", async () => {
  const user = userEvent.setup();
  const onAddComment = vi.fn();
  render(<CommentForm onAddComment={onAddComment} />);

  await user.type(screen.getByLabelText("Add comment"), "  Beautiful  ");
  await user.click(screen.getByRole("button", { name: "Send" }));

  expect(onAddComment).toHaveBeenCalledWith("Beautiful");
  expect(screen.getByLabelText("Add comment")).toHaveValue("");
});

test("does not submit an empty comment", async () => {
  const user = userEvent.setup();
  const onAddComment = vi.fn();
  render(<CommentForm onAddComment={onAddComment} />);

  await user.click(screen.getByRole("button", { name: "Send" }));
  await user.type(screen.getByLabelText("Add comment"), "   ");
  await user.click(screen.getByRole("button", { name: "Send" }));

  expect(onAddComment).not.toHaveBeenCalled();
});

test("does not submit whitespace even when the browser validation is skipped", async () => {
  const user = userEvent.setup();
  const onAddComment = vi.fn();
  render(<CommentForm onAddComment={onAddComment} />);

  const field = screen.getByLabelText("Add comment");
  field.removeAttribute("required");
  await user.type(field, "   ");
  await user.click(screen.getByRole("button", { name: "Send" }));

  expect(onAddComment).not.toHaveBeenCalled();
});
