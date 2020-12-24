import React from "react";
import { render, fireEvent, waitForDomChange } from "@testing-library/react";
import ShowSubmit from "./ShowSubmit";
import { Provider } from "react-redux";
import { createStore } from "redux";
import authReducer from "../redux/authReducer";
import * as apiCalls from "../api/apiCalls";

const defaultState = {
  id: 1,
  username: "user1",
  displayName: "display1",
  image: "profile1.png",
  password: "P4ssword",
  isLoggedIn: true,
};

let store;

const setup = (state = defaultState) => {
  store = createStore(authReducer, state);

  return render(
    <Provider store={store}>
      <ShowSubmit />
    </Provider>
  );
};

describe("ShowSubmit", () => {
  describe("Layout", () => {
    it("has textarea", () => {
      const { container } = setup();
      const textArea = container.querySelector("textarea");
      expect(textArea).toBeInTheDocument();
    });

    it("has image", () => {
      const { container } = setup();
      const image = container.querySelector("img");
      expect(image).toBeInTheDocument();
    });

    it("displays textarea 1 line", () => {
      const { container } = setup();
      const textArea = container.querySelector("textarea");
      expect(textArea.rows).toBe(1);
    });

    it("displays user image", () => {
      const { container } = setup();
      const image = container.querySelector("img");
      expect(image.src).toContain("/images/profile/" + defaultState.image);
    });
  });
  describe("Interactions", () => {
    let textArea;
    const setupFocused = () => {
      const rendered = setup();
      textArea = rendered.container.querySelector("textarea");
      fireEvent.focus(textArea);
      return rendered;
    };

    it("displays 3 rows when focused to textarea", () => {
      setupFocused();
      expect(textArea.rows).toBe(3);
    });

    it("displays the Make button when focused to textarea", () => {
      const { queryByText } = setupFocused();
      const makeButton = queryByText("Make");
      expect(makeButton).toBeInTheDocument();
    });

    it("displays the Cancel button when focused to textarea", () => {
      const { queryByText } = setupFocused();
      const cancelButton = queryByText("Cancel");
      expect(cancelButton).toBeInTheDocument();
    });

    it("does not display the Make button when not focused to textarea", () => {
      const { queryByText } = setup();
      const makeButton = queryByText("Make");
      expect(makeButton).not.toBeInTheDocument();
    });

    it("does not display the Cancel button when not focused to textarea", () => {
      const { queryByText } = setup();
      const cancelButton = queryByText("Cancel");
      expect(cancelButton).not.toBeInTheDocument();
    });

    it("returns back to unfocused state after clicking the cancel", () => {
      const { queryByText } = setupFocused();
      const cancelButton = queryByText("Cancel");
      fireEvent.click(cancelButton);
      expect(queryByText("Cancel")).not.toBeInTheDocument();
    });

    it("calls postShow with show request object when clicking the Make button", () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      apiCalls.postShow = jest.fn().mockResolvedValue({});
      fireEvent.click(makeButton);

      expect(apiCalls.postShow).toHaveBeenCalledWith({
        content: "Test show content",
      });
    });

    it("returns back to unfocused state after successful postShow action", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      apiCalls.postShow = jest.fn().mockResolvedValue({});
      fireEvent.click(makeButton);

      await waitForDomChange();
      expect(queryByText("Make")).not.toBeInTheDocument();
    });

    it("clears content after successful postShow action", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      apiCalls.postShow = jest.fn().mockResolvedValue({});
      fireEvent.click(makeButton);

      await waitForDomChange();
      expect(queryByText("Test show content")).not.toBeInTheDocument();
    });

    it("clears content after clicking cancel", () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      fireEvent.click(queryByText("Cancel"));
      expect(queryByText("Test show content")).not.toBeInTheDocument();
    });

    it("disables Make button when there is postShow api call", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      const mockFunction = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });
      apiCalls.postShow = mockFunction;
      fireEvent.click(makeButton);
      fireEvent.click(makeButton);

      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it("disables Cancel button when there is postShow api call", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      const mockFunction = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });
      apiCalls.postShow = mockFunction;
      fireEvent.click(makeButton);
      const cancelButton = queryByText("Cancel");

      expect(cancelButton).toBeDisabled();
    });

    it("displays spinner when there is postShow api call", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      const mockFunction = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });
      apiCalls.postShow = mockFunction;
      fireEvent.click(makeButton);

      expect(queryByText("Loading...")).toBeInTheDocument();
    });

    it("enables Make button when postShow api call fails", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: "It must have minimum 10 and maximum 5000 characters",
            },
          },
        },
      });
      apiCalls.postShow = mockFunction;
      fireEvent.click(makeButton);
      await waitForDomChange();

      expect(queryByText("Make")).not.toBeDisabled();
    });

    it("enables Cancel button when postShow api call fails", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: "It must have minimum 10 and maximum 5000 characters",
            },
          },
        },
      });
      apiCalls.postShow = mockFunction;
      fireEvent.click(makeButton);
      await waitForDomChange();

      expect(queryByText("Cancel")).not.toBeDisabled();
    });

    it("enables Make button after successful postShow action", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      apiCalls.postShow = jest.fn().mockResolvedValue({});
      fireEvent.click(makeButton);

      await waitForDomChange();

      fireEvent.focus(textArea);
      expect(queryByText("Make")).not.toBeDisabled();
    });

    it("displays validation error for content", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: "It must have minimum 10 and maximum 5000 characters",
            },
          },
        },
      });
      apiCalls.postShow = mockFunction;
      fireEvent.click(makeButton);
      await waitForDomChange();

      expect(
        queryByText("It must have minimum 10 and maximum 5000 characters")
      ).toBeInTheDocument();
    });

    it("clears validation error after clicking Cancel button", async () => {
      const { queryByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: "It must have minimum 10 and maximum 5000 characters",
            },
          },
        },
      });
      apiCalls.postShow = mockFunction;
      fireEvent.click(makeButton);
      await waitForDomChange();
      fireEvent.click(queryByText("Cancel"));

      expect(
        queryByText("It must have minimum 10 and maximum 5000 characters")
      ).not.toBeInTheDocument();
    });

    it("clears validation error after content is changed", async () => {
      const { queryByText, findByText } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const makeButton = queryByText("Make");
      const mockFunction = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            validationErrors: {
              content: "It must have minimum 10 and maximum 5000 characters",
            },
          },
        },
      });
      apiCalls.postShow = mockFunction;
      fireEvent.click(makeButton);
      const error = await findByText(
        'It must have minimum 10 and maximum 5000 characters'
      );
      fireEvent.change(textArea, { target: { value: "Test show content updated" } });

      expect(error).not.toBeInTheDocument();
    });

    it("displays file attachment input when text area focused", () => {
      const { container } = setupFocused();
      const uploadInput = container.querySelector("input");
      expect(uploadInput.type).toBe("file");
    });

    it("displays image component when file selected", async () => {
      apiCalls.postShowFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: "random-name.png",
        },
      });
      const { container } = setupFocused();

      const uploadInput = container.querySelector("input");
      expect(uploadInput.type).toBe("file");

      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitForDomChange();
      const images = container.querySelectorAll("img");
      const attachmentImage = images[1];
      expect(attachmentImage.src).toContain("data:image/png;base64");
    });

    it("removes selected image after clicking cancel", async () => {
      apiCalls.postShowFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: "random-name.png",
        },
      });
      const { container, queryByText } = setupFocused();

      const uploadInput = container.querySelector("input");
      expect(uploadInput.type).toBe("file");

      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitForDomChange();
      fireEvent.click(queryByText("Cancel"));
      fireEvent.focus(textArea);

      const images = container.querySelectorAll("img");
      expect(images.length).toBe(1);
    });

    it("calls postShowFile when file selected", async () => {
      apiCalls.postShowFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: "random-name.png",
        },
      });

      const { container } = setupFocused();

      const uploadInput = container.querySelector("input");
      expect(uploadInput.type).toBe("file");

      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitForDomChange();
      expect(apiCalls.postShowFile).toHaveBeenCalledTimes(1);
    });

    it("calls postShowFile with selected file", async () => {
      apiCalls.postShowFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: "random-name.png",
        },
      });

      const { container } = setupFocused();

      const uploadInput = container.querySelector("input");
      expect(uploadInput.type).toBe("file");

      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitForDomChange();
      const body = apiCalls.postShowFile.mock.calls[0][0];

      const readFile = () => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsText(body.get("file"));
        });
      };
      const result = await readFile();
      expect(result).toBe('dummy content');
    });

    it("calls postShow with show request with file attachment object when clicking the Make button", async () => {
      apiCalls.postShowFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: "random-name.png",
        },
      });
      const { queryByText, container } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const uploadInput = container.querySelector("input");
      expect(uploadInput.type).toBe("file");

      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitForDomChange();

      const makeButton = queryByText("Make");
      apiCalls.postShow = jest.fn().mockResolvedValue({});
      fireEvent.click(makeButton);

      expect(apiCalls.postShow).toHaveBeenCalledWith({
        content: "Test show content",
        attachment: {
          id: 1,
          name: "random-name.png",
        },
      });
    });

    it("clears image after postShow success", async () => {
      apiCalls.postShowFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: "random-name.png",
        },
      });
      const { queryByText, container } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const uploadInput = container.querySelector("input");
      expect(uploadInput.type).toBe("file");

      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitForDomChange();

      const makeButton = queryByText("Make");
      apiCalls.postShow = jest.fn().mockResolvedValue({});
      fireEvent.click(makeButton);

      await waitForDomChange();
      fireEvent.focus(textArea);
      const images = container.querySelectorAll("img");
      expect(images.length).toBe(1);
    });

    it("calls postShow without file attachment after cancelling previous file selection", async () => {
      apiCalls.postShowFile = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: "random-name.png",
        },
      });
      const { queryByText, container } = setupFocused();
      fireEvent.change(textArea, { target: { value: "Test show content" } });

      const uploadInput = container.querySelector("input");
      expect(uploadInput.type).toBe("file");

      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitForDomChange();

      fireEvent.click(queryByText("Cancel"));
      fireEvent.focus(textArea);

      const makeButton = queryByText("Make");
      apiCalls.postShow = jest.fn().mockResolvedValue({});
      fireEvent.change(textArea, { target: { value: "Test show content" } });
      fireEvent.click(makeButton);

      expect(apiCalls.postShow).toHaveBeenCalledWith({
        content: "Test show content",
      });
    });
  });
});
