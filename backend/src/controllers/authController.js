const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ============================================
// CONFIGURATION EMAIL
// ============================================
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ============================================
// MOT DE PASSE OUBLIÉ - DEMANDE
// ============================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email requis' });
        }

        const user = await User.findByEmailForReset(email);
        if (!user) {
            return res.status(404).json({ error: 'Aucun compte associé à cet email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000);

        await User.saveResetToken(email, resetToken, expiresAt);

        const resetUrl = `https://waripfinance.com/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Warip Finance" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Réinitialisation de votre mot de passe',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff; border-radius: 10px;">
                    <h1 style="color: #e9b64a; text-align: center;">Warip Finance</h1>
                    <h2 style="text-align: center; color: #e9b64a;">🔐 Réinitialisation de mot de passe</h2>
                    <p style="color: #ccc;">Bonjour ${user.first_name},</p>
                    <p style="color: #ccc;">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: #e9b64a; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            🔑 Réinitialiser mon mot de passe
                        </a>
                    </div>
                    <p style="color: #888; font-size: 12px;">Ce lien est valable 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                    <hr style="border: 1px solid #333; margin: 20px 0;">
                    <p style="color: #555; font-size: 11px; text-align: center;">Warip Finance - La banque qui réinvente la crypto</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: '✅ Un email de réinitialisation a été envoyé à votre adresse email.',
            success: true
        });

    } catch (error) {
        console.error('❌ Erreur forgotPassword:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }
};

// ============================================
// VÉRIFIER LE TOKEN DE RÉINITIALISATION
// ============================================
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token requis' });
        }

        const user = await User.findByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Token invalide ou expiré' });
        }

        res.json({
            valid: true,
            email: user.email,
            message: '✅ Token valide'
        });

    } catch (error) {
        console.error('❌ Erreur verifyResetToken:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
};

// ============================================
// RÉINITIALISER LE MOT DE PASSE
// ============================================
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        }

        const user = await User.findByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Token invalide ou expiré' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.resetPassword(user.email, hashedPassword);

        res.json({
            message: '✅ Mot de passe réinitialisé avec succès !',
            success: true
        });

    } catch (error) {
        console.error('❌ Erreur resetPassword:', error);
        res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
    }
};