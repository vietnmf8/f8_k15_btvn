// Alias
const $ = document.querySelector.bind(document); // Gán chặt this = document
const $$ = document.querySelectorAll.bind(document);

function Modal(options = {}) {
    // Lấy ra template, closeMethods hỗ trợ ĐÓNG modal theo 3 kiểu
    const { templateId, closeMethods = ["button", "overlay", "escape"] } =
        options;
    const template = $(`#${templateId}`);

    if (!template) {
        console.error(`${templateId} không tồn tại!`);
        return;
    }

    // Cho phép đóng modal = button
    this._allowButtonClose = closeMethods.includes("button");
    // Cho phép đóng modal = backdrop
    this._allowBackdropClose = closeMethods.includes("overlay");
    // Cho phép đóng modal = backdrop
    this._allowEscapeClose = closeMethods.includes("escape");

    /* TÍNH ĐỘ DÀI SCROLLBAR */
    function getScrollbarWidth() {
        if (getScrollbarWidth.value) {
            console.log("Không cần tính toán nựa!!");
            return getScrollbarWidth.value;
        }

        const div = document.createElement("div");
        Object.assign(div.style, {
            overflow: "scroll",
            position: "absolute",
            top: "-9999px",
        });

        // Thêm vào DOM để tính kích thước
        document.body.appendChild(div);

        // Kích thước thanh cuộn
        const scrollbarWidth = div.offsetWidth - div.clientWidth;

        // Remove div
        document.body.removeChild(div);

        getScrollbarWidth.value = scrollbarWidth;
        console.log("Tính toán lần đầu: ", scrollbarWidth);

        return scrollbarWidth;
    }

    /* MỞ MODAL */
    this.open = () => {
        // chỉ Clone phần tử, KHÔNG bao gồm sự kiện, tránh bị mất phần tử gốc
        content = template.content.cloneNode(true);

        // Tạo modal backdrop
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop";

        // Tạo modal container
        const container = document.createElement("div");
        container.className = "modal-container";

        if (this._allowButtonClose) {
            // Tạo nút đóng
            const closeBtn = document.createElement("button");
            closeBtn.className = "modal-close";
            closeBtn.innerHTML = "&times;";

            container.append(closeBtn);

            // Click vào nút Close
            closeBtn.onclick = () => this.closeModal(backdrop);
        }

        // Tạo modal content
        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        /* Append */
        modalContent.append(content);
        container.append(modalContent);
        backdrop.append(container);
        document.body.append(backdrop);

        // Dùng setTimeout để tự động hiển thị khi mount
        setTimeout(() => {
            backdrop.classList.add("show");
        }, 0);

        /* Lắng nghe sự kiện */

        // Cho phép nhấn vào Backdrop để đóng Modal
        if (this._allowBackdropClose) {
            // Click vào nền xám để tắt
            backdrop.onclick = (e) => {
                if (e.target === backdrop) {
                    this.closeModal(backdrop);
                }
            };
        }

        // Cho phép nhấn ESC để đóng Modal
        if (this._allowEscapeClose) {
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    this.closeModal(backdrop);
                }
            });
        }

        /* Xử lý ngăn chặn lăn chuột ở Document khi cuộn modal */
        // Disable Scrolling
        document.body.classList.add("no-scroll");
        document.body.style.paddingRight = getScrollbarWidth() + "px";

        return backdrop;
    };

    /* ĐÓNG MODAL */
    this.closeModal = (modalElement) => {
        modalElement.classList.remove("show");
        modalElement.ontransitionend = () => {
            modalElement.remove();
        };

        // Enable Scrolling
        document.body.classList.remove("no-scroll");
        document.body.style.paddingRight = "";
    };
}

/* Modal 1 */

const modal1 = new Modal({
    templateId: "modal-1",
    // closeMethods: ['button'],
});

$("#open-modal-1").onclick = () => {
    const modalElement = modal1.open();

    // Lấy ra img
    const img = modalElement.querySelector("img");
    console.log(img);
};

/* Modal 2 */

const modal2 = new Modal({
    templateId: "modal-2",
    closeMethods: ['button', 'escape'],
});

$("#open-modal-2").onclick = () => {
    const modalElement = modal2.open();

    const form = modalElement.querySelector("#login-form");
    if (form) {
        form.onsubmit = (e) => {
            // Ngăn load lại trang!
            e.preventDefault();
            console.log("Submitted!");

            const formData = {
                email: $("#email").value.trim(),
                password: $("#password").value.trim(),
            };

            console.log(formData);
        };
    }
};
