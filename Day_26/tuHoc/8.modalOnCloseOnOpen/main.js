// Alias
const $ = document.querySelector.bind(document); // Gán chặt this = document
const $$ = document.querySelectorAll.bind(document);

function Modal(options = {}) {
    const {
        templateId,
        cssClass = [],
        closeMethods = ["button", "overlay", "escape"],
        destroyOnClose = true, // Cho phép xoá DOM
        onOpen,
        onClose,
    } = options;
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

        // Set thuộc tính value
        getScrollbarWidth.value = scrollbarWidth;
        return scrollbarWidth;
    }

    /* BUILD PHẦN TỬ */

    this._build = () => {
        // chỉ Clone phần tử, KHÔNG bao gồm sự kiện, tránh bị mất phần tử gốc
        const content = template.content.cloneNode(true);

        // Tạo modal backdrop
        this._backdrop = document.createElement("div");
        this._backdrop.className = "modal-backdrop";

        // Tạo modal container
        const container = document.createElement("div");
        container.className = "modal-container";

        cssClass.forEach((className) => {
            if (typeof className === "string") {
                container.classList.add(className);
            }
        });

        if (this._allowButtonClose) {
            // Tạo nút đóng
            const closeBtn = document.createElement("button");
            closeBtn.className = "modal-close";
            closeBtn.innerHTML = "&times;";

            container.append(closeBtn);

            // Click vào nút Close
            closeBtn.onclick = () => this.close();
        }

        // Tạo modal content
        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        /* Append */
        modalContent.append(content);
        container.append(modalContent);
        this._backdrop.append(container);
        document.body.append(this._backdrop);
    };

    /* XỬ LÝ ĐÓNG MODAL BẰNG ESC */
    this._handleEscKey = (e) => {
        if (e.key === "Escape") {
            this.close();
        }
    };

    /* MỞ MODAL */

    this.open = () => {
        // Nếu phần tử không có trong DOM
        if (!this._backdrop) {
            // Build phần tử DOM
            this._build();
        }

        // Dùng setTimeout để tự động hiển thị khi mount
        setTimeout(() => {
            this._backdrop.classList.add("show");
        }, 0);

        /* Lắng nghe sự kiện */

        // Cho phép nhấn vào Backdrop để đóng Modal
        if (this._allowBackdropClose) {
            this._backdrop.onclick = (e) => {
                if (e.target === this._backdrop) {
                    this.close();
                }
            };
        }

        // Cho phép nhấn ESC để đóng Modal
        if (this._allowEscapeClose) {
            document.addEventListener("keydown", this._handleEscKey);
        }

        /* Xử lý ngăn chặn lăn chuột ở Document khi cuộn modal */

        // Disable Scrolling
        document.body.classList.add("no-scroll");
        document.body.style.paddingRight = getScrollbarWidth() + "px";

        this._onTransitionEnd(() => {
            if (typeof onClose === "function") onOpen();
        });

        return this._backdrop;
    };

    /* XỬ LÝ KHI KẾT THÚC HIỆU ỨNG TRANSITION */

    this._onTransitionEnd = (callback) => {
        // Chỉ chọn 1 hiệu ứng -> chạy 1 lần
        this._backdrop.ontransitionend = (e) => {
            if (e.propertyName !== "transform") return;
            if (typeof callback === "function") callback();
        };
    };

    /* ĐÓNG MODAL */

    this.close = (destroy = destroyOnClose) => {
        this._backdrop.classList.remove("show");
        this._onTransitionEnd(() => {
            if (this._backdrop && destroy) {
                this._backdrop.remove();
                this._backdrop = null;
            }
            // gỡ bỏ listener ESC
            if (this._allowEscapeClose) {
                document.removeEventListener("keydown", this._handleEscKey);
            }
            // Enable Scrolling
            document.body.classList.remove("no-scroll");
            document.body.style.paddingRight = "";
            if (typeof onClose === "function") onClose();
        });
    };

    this.destroy = () => {
        this.close(true);
    };
}

/* Modal 1 */

const modal1 = new Modal({
    templateId: "modal-1",
    // closeMethods: ['button'],
    destroyOnClose: false,
    onOpen: () => {
        console.log("Modal 1 onOpen");
    },
    onClose: () => {
        console.log("Modal 1 onClose");
    },
});

$("#open-modal-1").onclick = () => {
    // Lấy được phần tử backdrop
    const modalElement = modal1.open();

    // Lấy ra img
    const img = modalElement.querySelector("img");
};

/* Modal 2 */

const modal2 = new Modal({
    templateId: "modal-2",
    // closeMethods: ["button", "escape"],
    cssClass: ["class1", "class2"],
    onOpen: () => {
        console.log("Modal 2 onOpen");
    },
    onClose: () => {
        console.log("Modal 2 onClose");
    },
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
