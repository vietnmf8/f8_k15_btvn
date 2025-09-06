// Alias
const $ = document.querySelector.bind(document); // Gán chặt this = document
const $$ = document.querySelectorAll.bind(document);

// Tạo thuộc tính chung để chia sẻ cho tất cả các instant
Modal.elements = [];

function Modal(options = {}) {
    const {
        templateId,
        cssClass = [],
        closeMethods = ["button", "overlay", "escape"],
        destroyOnClose = true, // Cho phép xoá DOM
        onOpen,
        onClose,
        footer = false,
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

    this._getScrollbarWidth = () => {
        if (this._scrollbarWidth) return this._scrollbarWidth;

        const div = document.createElement("div");
        Object.assign(div.style, {
            overflow: "scroll",
            position: "absolute",
            top: "-9999px",
        });

        // Thêm vào DOM để tính kích thước
        document.body.appendChild(div);

        // Kích thước thanh cuộn
        this._scrollbarWidth = div.offsetWidth - div.clientWidth;

        // Remove div
        document.body.removeChild(div);

        return this._scrollbarWidth;
    };

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
            const closeBtn = this._createButton(
                "&times;",
                "modal-close",
                this.close
            );

            container.append(closeBtn);
        }

        // Tạo modal content
        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        /* Append */
        modalContent.append(content);
        container.append(modalContent);

        // Tạo modal footer
        if (footer) {
            this._modalFooter = document.createElement("div");
            this._modalFooter.className = "modal-footer";

            this._renderFooterContent();

            this._renderFooterButtons();

            container.append(this._modalFooter);
        }

        this._backdrop.append(container);
        document.body.append(this._backdrop);
    };

    /* XỬ LÝ ĐÓNG MODAL BẰNG ESC */
    this._handleEscKey = (e) => {
        const lastModal = Modal.elements[Modal.elements.length - 1];

        if (e.key === "Escape" && this === lastModal) {
            this.close();
        }
    };

    /* THÊM HTML VÀO FOOTER */
    this.setFooterContent = (html) => {
        this._footerContent = html;
        this._renderFooterContent();
    };

    /* Thuộc tính lưu các button ở footer */
    this._footerButtons = [];

    /* XỬ LÝ THÊM BUTTON VÀO FOOTER */
    this.addFooterButton = (title, cssClass, callback) => {
        const button = this._createButton(title, cssClass, callback);

        // Thêm button vào mảng
        this._footerButtons.push(button);

        this._renderFooterButtons();
    };

    /* RENDER FOOTER CONTENT */
    this._renderFooterContent = () => {
        if (this._modalFooter && this._footerContent) {
            this._modalFooter.innerHTML = this._footerContent;
        }
    };

    /* RENDER FOOTER BUTTON */
    this._renderFooterButtons = () => {
        if (this._modalFooter) {
            // Lặp qua mảng chứa các nút
            this._footerButtons.forEach((button) => {
                this._modalFooter.append(button);
            });
        }
    };

    /* XỬ LÝ TẠO BUTTON */
    this._createButton = (title, cssClass, callback) => {
        const button = document.createElement("button");
        button.className = cssClass;
        button.innerHTML = title;
        button.onclick = callback;

        return button;
    };

    /* MỞ MODAL */

    this.open = () => {
        // Thêm object modal đó vào mảng
        // this: object được khởi tạo từ new Modal (modal1, modal2,...)
        Modal.elements.push(this);

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
        document.body.style.paddingRight = this._getScrollbarWidth() + "px";

        this._onTransitionEnd(onOpen);

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
        // Xoá khỏi mảng
        // pop: xoá phần tử cuối cùng trong mảng
        Modal.elements.pop();

        this._backdrop.classList.remove("show");

        // gỡ bỏ listener ESC
        if (this._allowEscapeClose) {
            document.removeEventListener("keydown", this._handleEscKey);
        }

        this._onTransitionEnd(() => {
            if (this._backdrop && destroy) {
                this._backdrop.remove();
                this._backdrop = null;
                this.modalFooter = null;
            }
            // Enable Scrolling
            if (!Modal.elements.length) {
                document.body.classList.remove("no-scroll");
                document.body.style.paddingRight = "";
            }

            if (typeof onClose === "function") onClose();
        });
    };

    /* XOÁ KHỎI DOM */
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

/* Modal 3 */

const modal3 = new Modal({
    templateId: "modal-3",
    footer: true,
    closeMethods: [],
    onOpen: () => {
        console.log("Modal 3 onOpen");
    },
    onClose: () => {
        console.log("Modal 3 onClose");
    },
});

// modal3.setFooterContent("<h1>Hẹ hẹ3</h1>");

/* Kỳ vọng */

modal3.addFooterButton("Danger", "modal-btn danger pull-left", (e) => {
    alert("Danger clicked!");
});

modal3.addFooterButton("Cancel", "modal-btn", (e) => {
    modal3.close();
});

modal3.addFooterButton("<span>Agree</span>", "modal-btn primary", (e) => {
    //....
    modal3.close();
});

$("#open-modal-3").onclick = () => {
    modal3.open();
};
