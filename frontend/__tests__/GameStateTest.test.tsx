import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import GameStateTest from "./GameStateTest";

describe("state chance on click", () => {
  it("render the state", () => {
    render(<GameStateTest />);
  });
});
