import { Router } from 'express';
import { UserSettingsController } from '../controllers/userSettings';

const router = Router();

router.get('/settings', UserSettingsController.getSettings);
router.put('/settings', UserSettingsController.updateSettings);
router.put('/profile', UserSettingsController.updateProfile);
router.put('/password', UserSettingsController.updatePassword);

export default router;
