/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, getBridgedFunctions, t } from '@zextras/carbonio-shell-ui';
import React, { useState, useMemo, useCallback, ReactElement } from 'react';
import { find } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { moveAppointmentRequest } from '../../store/actions/move-appointment';
import { Invite } from '../../types/store/invite';
import { NewModal } from './new-calendar-modal';
import { MoveModal } from './move-modal';
import { selectCalendars } from '../../store/selectors/calendars';

type MoveAppointmentProps = {
	onClose: () => void;
	invite: Invite;
};

export const MoveApptModal = ({ onClose, invite }: MoveAppointmentProps): ReactElement => {
	const dispatch = useDispatch();
	const folders = useSelector(selectCalendars);
	const currentFolder = useMemo(
		() => find(folders, ['id', invite.ciFolder]) ?? folders[0],
		[folders, invite.ciFolder]
	);
	const [showNewFolderModal, setShowNewFolderModal] = useState(false);

	const toggleModal = useCallback(
		() => setShowNewFolderModal(!showNewFolderModal),
		[showNewFolderModal]
	);

	const moveAppt = (data: any): void => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(moveAppointmentRequest(data)).then((res: any) => {
			if (res.type.includes('fulfilled')) {
				getBridgedFunctions().createSnackbar({
					key: invite.ciFolder === FOLDERS.TRASH ? 'restore' : 'move',
					replace: true,
					type: 'info',
					hideButton: true,
					label:
						invite.ciFolder === FOLDERS.TRASH
							? `${t('message.snackbar.appt_restored', 'Appointment restored successfully to')} ${
									data.destinationCalendarName
							  }`
							: `${t('message.snackbar.appt_moved', 'Appointment moved successfully to')} ${
									data.destinationCalendarName
							  }`,
					autoHideTimeout: 3000
				});
			} else {
				getBridgedFunctions().createSnackbar({
					key: invite.ciFolder === FOLDERS.TRASH ? 'restore' : 'move',
					replace: true,
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			}
		});
	};

	return (
		<>
			{showNewFolderModal ? (
				<NewModal
					toggleModal={toggleModal}
					onClose={onClose}
					currentFolder={currentFolder}
					folders={folders}
					invite={invite}
					action={moveAppt}
				/>
			) : (
				<MoveModal
					toggleModal={toggleModal}
					onClose={onClose}
					currentFolder={currentFolder}
					folders={folders}
					invite={invite}
					action={moveAppt}
				/>
			)}
		</>
	);
};
