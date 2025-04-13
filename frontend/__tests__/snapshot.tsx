import { render } from "@testing-library/react";
import GameStateTest from "./GameStateTest";

it("render gamestate unchanged", () => {
  const { container } = render(<GameStateTest />);
  expect(container).toMatchSnapshot();
});
