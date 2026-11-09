import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ArtPieceComment } from "../types";
import Comments from "./Comments";

const comments: ArtPieceComment[] = [
  { id: "1", text: "Golden fields", date: "2026-11-09T10:00:00.000Z" },
  { id: "2", text: "Busy harvest", date: "2026-11-09T11:30:00.000Z" },
];

function renderComments(
  list: ArtPieceComment[] = comments,
  onEditComment = vi.fn(),
  onDeleteComment = vi.fn()
) {
  render(
    <Comments
      comments={list}
      onEditComment={onEditComment}
      onDeleteComment={onDeleteComment}
    />
  );
}

function getComment(text: string) {
  const item = screen
    .getAllByRole("listitem")
    .find((li) => li.textContent?.includes(text));
  if (!item) throw new Error(`No comment with text ${text}`);
  return within(item);
}

test("shows a Comments section with the text and date of each comment", () => {
  renderComments();

  expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("Golden fields")).toBeInTheDocument();
  expect(
    screen.getByText(new Date(comments[0].date).toLocaleString())
  ).toHaveAttribute("datetime", comments[0].date);
  expect(
    screen.getByText(new Date(comments[1].date).toLocaleString())
  ).toBeInTheDocument();
});

test("shows a message when there are no comments", () => {
  renderComments([]);

  expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});

test("each comment has an Edit and a Delete button", () => {
  renderComments();

  expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
  expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
});

test("Delete calls onDeleteComment with the id of the comment", async () => {
  const user = userEvent.setup();
  const onDeleteComment = vi.fn();
  renderComments(comments, vi.fn(), onDeleteComment);

  await user.click(
    getComment("Busy harvest").getByRole("button", { name: "Delete" })
  );

  expect(onDeleteComment).toHaveBeenCalledWith("2");
});

test("Edit switches the buttons to Save and Cancel for this comment only", async () => {
  const user = userEvent.setup();
  renderComments();

  await user.click(
    getComment("Golden fields").getByRole("button", { name: "Edit" })
  );

  expect(screen.getByLabelText("Edit comment")).toHaveValue("Golden fields");
  expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  // the other comment keeps its buttons
  expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(1);
  expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
});

test("Save calls onEditComment with the trimmed text and ends editing", async () => {
  const user = userEvent.setup();
  const onEditComment = vi.fn();
  renderComments(comments, onEditComment);

  await user.click(
    getComment("Golden fields").getByRole("button", { name: "Edit" })
  );
  const field = screen.getByLabelText("Edit comment");
  await user.clear(field);
  await user.type(field, "  Golden wheat  ");
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(onEditComment).toHaveBeenCalledWith("1", "Golden wheat");
  expect(screen.queryByLabelText("Edit comment")).not.toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
});

test("Save does nothing for an empty text", async () => {
  const user = userEvent.setup();
  const onEditComment = vi.fn();
  renderComments(comments, onEditComment);

  await user.click(
    getComment("Golden fields").getByRole("button", { name: "Edit" })
  );
  const field = screen.getByLabelText("Edit comment");
  field.removeAttribute("required");
  await user.clear(field);
  await user.type(field, "   ");
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(onEditComment).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Edit comment")).toBeInTheDocument();
});

test("Cancel discards the changes and shows the original text", async () => {
  const user = userEvent.setup();
  const onEditComment = vi.fn();
  renderComments(comments, onEditComment);

  await user.click(
    getComment("Golden fields").getByRole("button", { name: "Edit" })
  );
  await user.type(screen.getByLabelText("Edit comment"), " changed");
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onEditComment).not.toHaveBeenCalled();
  expect(screen.getByText("Golden fields")).toBeInTheDocument();

  // editing again starts from the original text
  await user.click(
    getComment("Golden fields").getByRole("button", { name: "Edit" })
  );
  expect(screen.getByLabelText("Edit comment")).toHaveValue("Golden fields");
});
