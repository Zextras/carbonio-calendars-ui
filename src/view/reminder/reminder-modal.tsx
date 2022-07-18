/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, CustomModal } from '@zextras/carbonio-design-system';
import { addBoard, t } from '@zextras/carbonio-shell-ui';
import { isEmpty, map, omit } from 'lodash';
import moment from 'moment';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ModalHeader } from '../../commons/modal-header';
import { generateEditor } from '../../commons/editor-generator';
import ModalFooter from '../../commons/modal-footer';
import { CALENDAR_ROUTE } from '../../constants';
import { normalizeEditorFromInvite } from '../../normalizations/normalize-editor';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { dismissApptReminder } from '../../store/actions/dismiss-appointment-reminder';
import { getInvite } from '../../store/actions/get-invite';
import { ReminderItem, Reminders } from '../../types/appointment-reminder';
import { AppointmentReminderItem } from './appointment-reminder-item';
import { SetNewAppointmentTimeModal } from './set-new-appointment-time-modal';

export const ReminderModal = ({
	reminders,
	setReminders
}: {
	reminders: Reminders;
	setReminders: (arg: Reminders) => void;
}): ReactElement => {
	const [showNewTimeModal, setShowNewTimeModal] = useState(false);
	const [activeReminder, setActiveReminder] = useState<ReminderItem | undefined>(undefined);
	const toggleModal = useCallback(() => setShowNewTimeModal(!showNewTimeModal), [showNewTimeModal]);
	const dispatch = useDispatch();

	const openModal = useMemo(() => !isEmpty(reminders), [reminders]);

	const dismissAll = useCallback(() => {
		const dismissItems = map(reminders, (a) => ({
			id: a.id,
			dismissedAt: moment().valueOf()
		}));
		setShowNewTimeModal(false);
		if (dismissItems.length > 0) {
			dispatch(dismissApptReminder({ dismissItems }));
			setReminders({});
		}
	}, [dispatch, reminders, setReminders]);

	const removeFromAppList = useCallback(
		(key: string) => {
			const tmp = omit(reminders, key);
			setReminders(tmp);
		},
		[reminders, setReminders]
	);

	const setNewTime = useCallback(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(getInvite({ inviteId: activeReminder.inviteId })).then(({ payload }) => {
			const invite = normalizeInvite(payload.m);
			const editorData = normalizeEditorFromInvite(invite);
			const { editor, callbacks } = generateEditor(
				activeReminder?.id ?? 'new',
				{
					...editorData,
					isSeries: true,
					isInstance: false,
					isException: false
				},
				false
			);
			addBoard({
				url: `${CALENDAR_ROUTE}/`,
				title: editor.title,
				context: { ...editor, callbacks }
			});
			dismissAll();
		});
	}, [activeReminder, dismissAll, dispatch]);

	const headerLabel = useMemo(
		() =>
			t(`label.appt_reminder`, {
				count: Object.keys(reminders)?.length ?? 1,
				defaultValue: 'Appointment Reminder',
				defaultValue_Plural: 'Appointment Reminders'
			}),
		[reminders]
	);

	const footerLabel = useMemo(
		() =>
			t('label.dismiss', {
				count: Object.keys(reminders)?.length ?? 1,
				defaultValue: 'Dismiss',
				defaultValue_Plural: 'Dismiss all'
			}),
		[reminders]
	);

	return (
		<CustomModal
			open={openModal}
			onClose={(): null => null}
			maxHeight="90vh"
			onClick={(e: MouseEvent): void => e.stopPropagation()}
			onDoubleClick={(e: MouseEvent): void => e.stopPropagation()}
		>
			{showNewTimeModal ? (
				<SetNewAppointmentTimeModal toggleModal={toggleModal} setNewTime={setNewTime} />
			) : (
				<Container
					padding={{ all: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					height="fit"
					width="100%"
				>
					<ModalHeader title={headerLabel} />
					<Container maxHeight={320} style={{ overflow: 'auto', display: 'block' }}>
						{map(reminders, (reminder) => (
							<AppointmentReminderItem
								reminderItem={reminder}
								key={reminder.key}
								removeReminder={removeFromAppList}
								toggleModal={toggleModal}
								setActiveReminder={setActiveReminder}
							/>
						))}
					</Container>
					<ModalFooter label={footerLabel} onConfirm={dismissAll} />
				</Container>
			)}
		</CustomModal>
	);
};
