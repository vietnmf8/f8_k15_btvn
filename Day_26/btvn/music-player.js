const player = {
    /* CONSTANT */
    NEXT: 1,
    PREV: -1,

    /* MẢNG CHỨA BÀI HÁT */
    songs: [
        // _songs: Private -> Chỉ dùng trong object player, không dùng bên ngoài
        {
            id: 1,
            name: "Bạc Phận",
            path: `./musics/bacPhan.mp3`,
            artist: "Jack - J97",
        },
        {
            id: 2,
            name: "Em gì ơi",
            path: `./musics/emGiOi.mp3`,
            artist: "Jack - J97",
        },
        {
            id: 3,
            name: "Sóng gió",
            path: `./musics/songGio.mp3`,
            artist: "Jack - J97",
        },
        {
            id: 4,
            name: "Chúng Ta Rồi Sẽ Hạnh Phúc",
            path: `./musics/chungTaRoiSeHanhPhuc.mp3`,
            artist: "Jack - J97",
        },
        {
            id: 5,
            name: "Trạm Dừng Chân",
            path: `./musics/tramDungChan.mp3`,
            artist: "Jack - J97",
        },
        {
            id: 6,
            name: "Vực Thẳm Của Bình Yên",
            path: `./musics/vucThamCuaBinhYen.mp3`,
            artist: "Jack - J97",
        },
    ],
    /* ==========================================================
     * KHỞI TẠO:  DOM
     * ==========================================================*/
    playlist: document.querySelector(".playlist"),
    songTitle: document.querySelector(".song-title"),
    audio: document.querySelector("#audio"),
    togglePlayBtn: document.querySelector(".btn-toggle-play"),
    player: document.querySelector(".player"),
    btnNext: document.querySelector(".btn-next"),
    btnPrev: document.querySelector(".btn-prev"),
    btnRepeat: document.querySelector(".btn-repeat"),
    progress: document.querySelector(".progress"),
    cd: document.querySelector(".cd"),
    btnRandom: document.querySelector(".btn-random"),

    /* ==========================================================
     * KHỞI TẠO: BIẾN
     * ==========================================================*/
    currentIndex: 0, // Index của bài hát BAN ĐẦU.
    isSeeking: false, // Kiểm tra xem có đang chủ động tua thanh seekbar không?
    isRepeat: localStorage.getItem("isRepeat") === "true", // Kiểm tra xem có đang ở trạng thái Repeat không?
    isShuffle: localStorage.getItem("isShuffle") === "true", // Kiểm tra xem có đang ở trạng thái Shuffle không?
    playedIndexes: [], // Mảng chứa bài hát đã phát

    /* ==========================================================
     * PHƯƠNG THỨC
     * ==========================================================*/

    /* LẤY RA BÀI HÁT HIỆN TẠI */
    getCurrentSong() {
        console.log(
            "Bài hát hiện tại là: ",
            this.currentIndex,
            this.songs[this.currentIndex].name
        );
        return this.songs[this.currentIndex];
    },

    /* TẢI BÀI HÁT HIỆN TẠI */
    loadCurrentSong() {
        const currentSong = this.getCurrentSong();
        this.songTitle.textContent = currentSong.name;
        this.audio.src = currentSong.path;
    },

    /* XỬ LÝ TIẾN LÙI INDEX / BÀI HÁT */
    handlePrevOrNext(step) {
        this.currentIndex =
            (this.currentIndex + step + this.songs.length) % this.songs.length;
        this.loadCurrentSong(); // Tải lại bài hát
        this.render(); // Render lại để cập nhật focus
        this.audio.play(); // Phát bài hát
    },

    /* XỬ LÝ BÀI HÁT NGẪU NHIÊN */
    playRandomSong() {
        // Trường hợp chỉ có 1 bài hát.
        if (this.songs.length === 1) {
            this.audio.play();
            return;
        }
        // Index bài hát chưa được phát
        let newIndex;

        // Tìm index của bài hát chưa được phát trước đó.
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.playedIndexes.includes(newIndex));

        // Đặt currentIndex = index vừa tìm được
        this.currentIndex = newIndex;

        // Tải lại bài hát.
        this.loadCurrentSong();
        // Render lại
        this.render();
        // Tự động play;
        this.audio.play();

        // Thêm newIndex vào danh sách đã phát.
        this.playedIndexes.push(newIndex);

        // Nếu đã phát hết tất cả -> Reset mảng với bài đầu tiên là bài cuối của chu kỳ trước
        if (this.playedIndexes.length === this.songs.length) {
            this.playedIndexes = [this.currentIndex];
        }

        console.log(this.playedIndexes);
    },

    /* KHỞI TẠO PLAYER */
    init() {
        /* 
            Tải bài hát hiện tại
        */
        this.loadCurrentSong();

        /* Xử lý khi bật Shuffle khi trang được tải lại */
        if (this.isShuffle) {
            this.playedIndexes = [this.currentIndex];
        }

        /* 
            Khi click vào nút Toggle:
                - Play/pause bài hát
        */
        this.togglePlayBtn.addEventListener("click", () => {
            // Kiểm tra bài hát có đang được Pause hay không?
            const isPaused = this.audio.paused;
            // Nếu bài hát được Pause -> Click vào nút Toggle sẽ PLAY bài hát.
            if (isPaused) {
                this.audio.play();
            }
            // Ngược lại khi bài hát đang được phát -> Click vào nút Toggle sẽ PAUSE bài hát.
            else {
                this.audio.pause();
            }
        });

        /* 
            Trạng thái Play/Pause của audio:
                - Thay đổi icon Play/Pause
        */
        // Trạng thái Play.
        this.audio.addEventListener("play", () => {
            // Khi bài hát Play -> Sửa icon thành fa-pause
            this.player.classList.add("playing");

            // Cho đĩa CD quay
            this.cd.classList.add("playing");
            this.cd.style.animationPlayState = "running"; // Tiếp tục quay
        });

        // Trạng thái Pause.
        this.audio.addEventListener("pause", () => {
            // Khi bài hát Pause -> Sửa icon thành fa-play
            this.player.classList.remove("playing");

            this.cd.style.animationPlayState = "paused"; // Tạm dừng quay
        });

        /* 
            Sự kiện cho nút Lùi, nút Tiến
        */

        // Khi nhấn nút Lùi
        this.btnPrev.addEventListener("click", () => {
            // Nếu bài hát chạy trên 2s -> nhấn lùi -> chạy lại bài hát hiện tại
            if (this.audio.currentTime > 2) {
                this.audio.currentTime = 0;
                return;
            }
            // Nếu bài hát chạy dưới 2s -> nhấn lùi -> lùi về bài trước đó hoặc bài ngẫu nhiên (nếu ở trạng thái shuffle)
            this.isShuffle
                ? this.playRandomSong()
                : this.handlePrevOrNext(this.PREV);

            console.log(this.playedIndexes);
        });

        // Khi nhấn nút Tiến
        this.btnNext.addEventListener("click", () => {
            if (this.isShuffle) {
                this.playRandomSong();
            } else {
                this.handlePrevOrNext(this.NEXT); // Xử lý vượt ngưỡng
            }
        });

        /* 
            Sự kiện timeupdate 
        */
        this.audio.addEventListener("timeupdate", () => {
            // currentTime: Số giây đang chạy
            // duration: Tổng thời gian của bài hát
            const { currentTime, duration } = this.audio;

            // khi mount lần đầu -> duration = NaN -> cần loại bỏ trường hợp này
            // Nếu đang "tua" -> không cho update thời gian liên tục nữa
            if (!duration || this.isSeeking) return;

            // Tính % = số giây hiện tại / tổng số giây
            // Tiến trình update theo thời gian
            this.progress.value = Math.round((currentTime / duration) * 100); // Math.round(): Làm tròn giây
        });

        /* 
            Khi kéo thanh seekbar
        */

        // Khi nhấn chuột xuống phần tử "progress"
        this.progress.addEventListener("mousedown", () => {
            // Khi nhấn xuống -> đang tua
            this.isSeeking = true;
        });

        // Khi nhả chuột ra phần tử "progress"
        this.progress.addEventListener("mouseup", (e) => {
            this.isSeeking = false;
            const nextProgress = e.target.value; // %
            const currentTime = (nextProgress / 100) * this.audio.duration; // Số giây

            // Cập nhật vào this.audio.currentTime
            this.audio.currentTime = currentTime;
        });

        /* 
            Khi nghe hết bài hát.
                - Nếu ở trạng thái Repeat -> nghe lại.
                - Nếu không ở trạng thái Repeat -> next sang bài tiếp theo. 
        */

        this.audio.addEventListener("ended", () => {
            // Nếu không bật repeat -> hết bài -> next bài
            if (!this.isRepeat) {
                this.handlePrevOrNext(this.NEXT);
            }
            // Nếu bật repeat -> hết bài -> phát lại
            else {
                this.audio.play();
            }
        });

        /* 
            Khi nhấn vào nút Repeat.
        */
        this.btnRepeat.addEventListener("click", () => {
            // Đảo ngược trạng thái: Mỗi khi isRepeat = false -> khi nhấn vào nút Repeat -> true -> Ngược lại
            this.isRepeat = !this.isRepeat;

            // Thêm/xoá class "active" dựa vào điều kiện isRepeat
            this.btnRepeat.classList.toggle("active", this.isRepeat);

            // Lưu isRepeat vào localstorage để lưu lại trạng thái
            localStorage.setItem("isRepeat", this.isRepeat);
        });

        /* 
            Khi nhấn vào nút Shuffle.
        */
        this.btnRandom.addEventListener("click", () => {
            // Đảo ngược trạng thái
            this.isShuffle = !this.isShuffle;

            // Thêm/xoá class "active" dựa vào isShuffle
            this.btnRandom.classList.toggle("active", this.isShuffle);

            // Lưu vào localStorage
            localStorage.setItem("isShuffle", this.isShuffle);

            // Khi bật nút Shuffle -> Thêm bài hát hiện tại vào Mảng
            if (this.isShuffle) {
                this.playedIndexes = [this.currentIndex];
            }
            // Tắt -> reset mảng về rỗng
            else {
                this.playedIndexes = [];
            }

            console.log(this.playedIndexes);
        });

        /* 
            Cập nhật trạng thái nút Repeat, Shuffle
        */

        // Khi khởi tạo: Thêm/xoá class "active" dựa vào điều kiện isRepeat, isShuffle
        this.btnRepeat.classList.toggle("active", this.isRepeat);
        this.btnRandom.classList.toggle("active", this.isShuffle);

        /* Khi click vào Playlist */
        this.playlist.addEventListener("click", (e) => {
            // Tìm phần tử cha (".song") gần nhất -> không có active
            const songNode = e.target.closest(".song:not(.active)");

            if (songNode) {
                // Tìm ra index của bài hát trong playlist
                const songIndex = Number(songNode.getAttribute("songIndex"));

                // Đặt index hiện tại = songIndex
                this.currentIndex = songIndex;

                // Tải bài hát.
                this.loadCurrentSong();

                // Render lại giao diện
                this.render();

                // Tự động phát bài hát.
                this.audio.play();
            }
        });

        /* 
            Render Playlist bài hát
        */
        this.render(); // this: player
    },

    /* RENDER DANH SÁCH BÀI HÁT */
    render() {
        const html = this.songs
            .map((song, index) => {
                return `
                <div class="song ${
                    this.currentIndex === index ? "active" : ""
                }" songIndex="${index}">
                    <div
                        class="thumb"
                        style="
                            background-image: url('https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg');
                        "
                    ></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.artist}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
            })
            .join(""); // join(""): Chuyển về string

        // Thêm vào trong thẻ playlist
        this.playlist.innerHTML = html;
    },
};

// Khởi tạo
player.init();
