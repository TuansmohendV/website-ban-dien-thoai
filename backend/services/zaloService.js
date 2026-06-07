import axios from 'axios';

/**
 * Service to send Zalo messages via Zalo OA API
 * Documentation: https://developers.zalo.me/docs/api/official-account-api/tin-nhan/gui-tin-nhan-bang-zns-post-5023
 */
export const sendZaloOTP = async (phone, otp) => {
    const accessToken = process.env.ZALO_ACCESS_TOKEN;
    const templateId = process.env.ZALO_TEMPLATE_ID;

    if (!accessToken) {
        console.log('--- ZALO OTP MOCK ---');
        console.log(`To: ${phone}`);
        console.log(`Message: Ma OTP cua ban la ${otp}. Vui long khong chia se cho bat ky ai.`);
        console.log('---------------------');
        return { success: true, mock: true };
    }

    try {
        // This is a template call for Zalo ZNS (Zalo Notification Service)
        const response = await axios.post(
            'https://business.openapi.zalo.me/message/template',
            {
                phone: phone.startsWith('0') ? '84' + phone.substring(1) : phone,
                template_id: templateId,
                template_data: {
                    otp: otp,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    access_token: accessToken,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error sending Zalo OTP:', error.response?.data || error.message);
        throw new Error('Khong the gui tin nhan Zalo luc nay.');
    }
};
