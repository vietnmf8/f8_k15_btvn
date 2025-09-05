// Alias
const $ = document.querySelector.bind(document); // Gán chặt this = document
const $$ = document.querySelectorAll.bind(document);

function Modal() {
    // Cache
    /* TÍNH ĐỘ DÀI SCROLLBAR */
    function getScrollbarWidth () {
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
    };

    /* MỞ MODAL */
    this.openModal = (options = {}) => {
        const { templateId, allowBackdropClose = true } = options;
        const template = $(`#${templateId}`);

        if (!template) {
            console.error(`${templateId} không tồn tại!`);
            return;
        }

        // chỉ Clone phần tử, KHÔNG bao gồm sự kiện, tránh bị mất phần tử gốc
        content = template.content.cloneNode(true);

        // Tạo modal backdrop
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop";

        // Tạo modal container
        const container = document.createElement("div");
        container.className = "modal-container";

        // Tạo nút đóng
        const closeBtn = document.createElement("button");
        closeBtn.className = "modal-close";
        closeBtn.innerHTML = "&times;";

        // Tạo modal content
        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        /* Append */
        modalContent.append(content);
        container.append(closeBtn, modalContent);
        backdrop.append(container);
        document.body.append(backdrop);

        // Dùng setTimeout để tự động hiển thị khi mount
        setTimeout(() => {
            backdrop.classList.add("show");
        }, 0);

        /* Lắng nghe sự kiện */

        // Click vào nút Close
        closeBtn.onclick = () => this.closeModal(backdrop);

        // Cho phép nhấn vào Backdrop để đóng Modal
        if (allowBackdropClose) {
            // Click vào nền xám để tắt
            backdrop.onclick = (e) => {
                if (e.target === backdrop) {
                    this.closeModal(backdrop);
                }
            };
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeModal(backdrop);
            }
        });

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

const modal = new Modal();
// Chạy khi mount
// modal.openModal("<h1>Hello World!</h1>");

// Lấy DOM cho nút
$("#open-modal-1").onclick = () => {
    const modalElement = modal.openModal({
        templateId: "modal-1",
    });

    // Lấy ra img
    const img = modalElement.querySelector("img");
    console.log(img);
};

// Lấy DOM cho nút
$("#open-modal-2").onclick = () => {
    const modalElement = modal.openModal({
        templateId: "modal-2",
        // Cho phép đóng modal khi nhấn vào backdrop
        allowBackdropClose: false, // không cho phép
    });

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

// const box = $("#box");
// // console.log(box.clientWidth); // không bao gồm cuộn
// // console.log(box.offsetWidth); // bao gồm cuộn

// console.log(box.offsetWidth - box.clientWidth); // Width của thanh cuộn
