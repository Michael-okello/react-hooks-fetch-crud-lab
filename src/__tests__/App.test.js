import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";
import userEvent from "@testing-library/user-event";
import App from "../components/App";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays question prompts after fetching", async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/View Questions/i));
  expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 2/i)).toBeInTheDocument();
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);

  await screen.findByText(/lorem testum 1/i);

  fireEvent.click(screen.getByText(/New Question/));

  fireEvent.change(screen.getByLabelText(/Prompt/), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 1/), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 2/), {
    target: { value: "Test Answer 2" },
  });
  fireEvent.change(screen.getByLabelText(/Correct Answer/), {
    target: { value: "1" },
  });

  fireEvent.submit(screen.getByTestId("question-form"));

  fireEvent.click(screen.getByText(/View Questions/));

  expect(await screen.findByText(/Test Prompt/i)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
});

test("deletes the question when the delete button is clicked", async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/View Questions/));
  await screen.findByText(/lorem testum 1/i);

  fireEvent.click(screen.getAllByText("Delete Question")[0]);

  await waitForElementToBeRemoved(() => screen.queryByText(/lorem testum 1/i));
  expect(screen.queryByText(/lorem testum 1/i)).not.toBeInTheDocument();
});

test("updates the answer when the dropdown is changed", async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/View Questions/));

  await screen.findByText(/lorem testum 2/i);

  const dropdown = screen.getAllByLabelText(/Correct Answer/)[0];

  // Select new answer index
  await userEvent.selectOptions(dropdown, "3");

  // Wait for the dropdown to reflect the updated value
  await waitFor(() => {
    expect(dropdown.value).toBe("3");
  });
});
