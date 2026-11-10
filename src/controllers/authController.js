exports.logout = (req, res) => {
    try {
        // Jika menggunakan JWT dengan Cookie
        res.clearCookie('token'); 
        
        return res.status(200).json({ 
            success: true, 
            message: "Berhasil logout." 
        });
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan pada server saat logout." });
    }
};