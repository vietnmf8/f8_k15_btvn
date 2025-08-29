const player = {
    /* Mảng chứa các bài hát */
    songs: [
        // _songs: Private -> Chỉ dùng trong object player, không dùng bên ngoài
        {
            id: 1,
            name: "Bạc Phận",
            path: `./musics/Bạc Phận.mp3`,
            artist: "Jack - J97",
        },
        {
            id: 2,
            name: "Em gì ơi",
            path: `./musics/Bạc Phận.mp3`,
            artist: "Jack - J97",
        },
        {
            id: 3,
            name: "Sóng gió",
            path: `./musics/Bạc Phận.mp3`,
            artist: "Jack - J97",
        },
    ],
    /* ==========================================================
     * Khởi tạo DOM
     * ==========================================================*/
    playlist: document.querySelector(".playlist"),
    songTitle: document.querySelector(".song-title"),

    /* ==========================================================
     * Khởi tạo các biến
     * ==========================================================*/
    currentIndex: 0, // Index của bài hát hiện tại.

    /* ==========================================================
     * Phương thức
     * ==========================================================*/

    /* Lấy ra bài hát hiện tại */
    getCurrentSong() {
        return this.songs[this.currentIndex];
    },

    /* Khởi tạo */
    init() {
        // Hiển thị tên bài hát
        const currentSong = this.getCurrentSong();
        this.songTitle.textContent = currentSong.name;

        // Render Playlist bài hát
        this.render(); // this: player
    },

    /* Render playlist */
    render() {
        const html = this.songs
            .map((song) => {
                return `
                <div class="song">
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
