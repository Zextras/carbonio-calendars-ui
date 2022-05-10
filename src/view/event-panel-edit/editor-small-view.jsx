/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Checkbox,
	Container,
	Row,
	Divider,
	Padding,
	Select,
	Text,
	Button,
	ChipInput
} from '@zextras/carbonio-design-system';
import { map, find, sortBy, some } from 'lodash';
import {
	useUserAccount,
	useIntegratedComponent,
	useUserSettings
} from '@zextras/carbonio-shell-ui';
import { AttendeesContainer, TextArea, EditorWrapper } from './editor-complete-view';
import ExpandedButtons, { addAttachments } from './components/expanded-buttons';
import SaveSendButtons from './components/save-send-buttons';
import DataRecap from './components/data-recap';
import InputRow from './components/input-row';
import FreeBusySelector from './components/free-busy-selector';
import CalendarSelector from './components/calendar-selector';
import DatePicker from './components/date-picker';
import ReminderSelector from './components/reminder-selector';
import RecurrenceSelector from './components/recurrence-selector';
import AttachmentsBlock from '../event-panel-view/attachments-part';
import DropZoneAttachment from './components/dropzone-component';

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
export default function EditorSmallView({
	setTitle,
	data,
	callbacks,
	invite,
	updateAppTime = false,
	proposeNewTime,
	isInstance
}) {
	const [t] = useTranslation();
	const title = useMemo(() => (data && data.title !== '' ? data.title : 'No Subject'), [data]);
	const settings = useUserSettings();
	const account = useUserAccount();
	const [dropZoneEnable, setDropZoneEnable] = useState(false);
	const [showOptionals, setShowOptional] = useState(false);
	const toggleOptionals = useCallback(() => setShowOptional((show) => !show), []);

	useLayoutEffect(() => {
		setTitle && setTitle(title);
	}, [title, setTitle, data, callbacks]);

	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const [RoomSelector, isRoomAvailable] = useIntegratedComponent('room-selector');

	const onDragOverEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(true);
	};

	const [defaultIdentity, setDefaultIdentity] = useState({});
	const [list, setList] = useState([]);

	const newItems = useMemo(
		() =>
			map(list, (el) => ({
				label: el.label,
				value: el.value,
				address: el.address,
				fullname: el.fullName,
				type: el.type,
				identityName: el.identityName,
				customComponent: (
					<Container
						width="100%"
						takeAvailableSpace
						mainAlignment="space-between"
						orientation="horizontal"
						height="fit"
					>
						<Padding left="small">
							<Text>{el.label}</Text>
						</Padding>
					</Container>
				)
			})),
		[list]
	);
	useEffect(() => {
		const sortedList = sortBy(account.identities.identity, ({ name }) =>
			name === 'DEFAULT' ? 0 : 1
		);
		const identityList = map(sortedList, (item, idx) => ({
			value: idx,
			label: `${item.name}  (${item._attrs?.zimbraPrefFromDisplay} <${item._attrs?.zimbraPrefFromAddress}>)`,
			address: item._attrs?.zimbraPrefFromAddress,
			fullname: item._attrs?.zimbraPrefFromDisplay,
			type: item._attrs.zimbraPrefFromAddressType,
			identityName: item.name
		}));
		setDefaultIdentity(find(identityList, (item) => item?.identityName === 'DEFAULT'));
		setList(identityList);
	}, [account, t]);
	const onDropEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(false);
		addAttachments(
			callbacks.onSave,
			callbacks.uploadAttachments,
			data,
			invite,
			event.dataTransfer.files
		).then(({ payload, mp }) => {
			const attachments = map(payload, (file) => ({
				contentType: file.ct,
				disposition: 'attachment',
				filename: file.filename,
				name: undefined,
				size: file.s,
				aid: file.aid
			}));
			callbacks.onAttachmentsChange(
				{ aid: map(payload, (el) => el.aid), mp },
				data?.resource?.attachmentFiles
					? [...data.resource.attachmentFiles, ...attachments]
					: attachments,
				false
			);
		});
	};

	const onDragLeaveEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(false);
	};

	const onOrganizerChange = useCallback(
		(val) => {
			const selectedOrganizer = find(list, { value: val });
			callbacks.onOrganizerChange({
				email: selectedOrganizer.address,
				name: selectedOrganizer.fullname
			});
		},
		[callbacks, list]
	);

	const onAttendeesChange = useCallback(
		(participants) => {
			callbacks.onAttendeesChange(
				map(participants, (participant) =>
					participant.email
						? {
								type: 'to',
								address: participant.email,
								name: participant.firstName,
								fullName: participant.fullName,
								error: !emailRegex.test(participant.email)
						  }
						: {
								...participant,
								email: participant.label,
								address: participant.label,
								type: 'to',
								error: !emailRegex.test(participant.label)
						  }
				)
			);
		},
		[callbacks]
	);

	const onOptionalsChange = useCallback(
		(participants) => {
			callbacks.onAttendeesOptionalChange(
				map(participants, (participant) =>
					participant.email
						? {
								type: 'to',
								address: participant.email,
								name: participant.firstName,
								fullName: participant.fullName,
								error: !emailRegex.test(participant.email)
						  }
						: {
								...participant,
								email: participant.label,
								address: participant.label,
								type: 'to',
								error: !emailRegex.test(participant.label)
						  }
				)
			);
		},
		[callbacks]
	);

	const textAreaLabel = useMemo(
		() => t('messages.format_as_plain_text', 'Format as Plain Text'),
		[t]
	);

	useEffect(() => {
		if (data?.resource?.optionalAttendees?.length) {
			setShowOptional(true);
		}
	}, [data?.resource?.optionalAttendees?.length]);

	const [Composer, composerIsAvailable] = useIntegratedComponent('composer');
	return (
		<Container
			padding={{ horizontal: 'large', bottom: 'large' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			{data && (
				<Row
					orientation="horizontal"
					padding={{ top: 'small', bottom: 'small' }}
					height="fit"
					width="fill"
					mainAlignment="flex-end"
				>
					<ExpandedButtons
						data={data}
						callbacks={callbacks}
						invite={invite}
						disabled={proposeNewTime}
					/>
					<SaveSendButtons
						proposeNewTime={proposeNewTime}
						onSend={proposeNewTime ? callbacks.onProposeNewTime : callbacks.onSend}
						onSave={callbacks.onSave}
						data={data}
					/>
					<DataRecap data={data} />
					<Divider />
				</Row>
			)}
			<Container
				height="fit"
				background="gray6"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ all: 'large', bottom: 'extralarge' }}
				onDragOver={(event) => onDragOverEvent(event)}
				style={{
					overflowY: 'auto',
					display: 'block',
					float: 'left'
				}}
			>
				{dropZoneEnable && (
					<DropZoneAttachment
						onDragOverEvent={onDragOverEvent}
						onDropEvent={onDropEvent}
						onDragLeaveEvent={onDragLeaveEvent}
					/>
				)}
				{data && (
					<>
						<Container style={{ overflowY: 'auto' }} height="fit">
							{defaultIdentity && list.length && (
								<Select
									items={newItems}
									label={t('placeholder.organizer', 'Organizer')}
									defaultSelection={{
										label: defaultIdentity?.label,
										value: defaultIdentity?.value
									}}
									onChange={onOrganizerChange}
								/>
							)}
							<InputRow
								label={t('label.event_title', 'Event title')}
								defaultValue={data.title}
								onChange={callbacks.onSubjectChange}
								disabled={updateAppTime || proposeNewTime}
							/>

							<InputRow
								label={t('label.location', 'Location')}
								defaultValue={data.resource.location}
								onChange={callbacks.onLocationChange}
								disabled={updateAppTime || proposeNewTime}
							/>
							{isRoomAvailable && !proposeNewTime && (
								<>
									<Padding top="large" />
									<RoomSelector
										onChange={callbacks.onRoomChange}
										defaultValue={data.resource.room}
									/>
								</>
							)}
							<Row width="fill" padding={{ top: 'large' }}>
								<AttendeesContainer>
									<Container
										orientation="horizontal"
										background="gray5"
										style={{ overflow: 'hidden' }}
										padding={{ all: 'none' }}
									>
										<Container background="gray5" style={{ overflow: 'hidden' }}>
											{integrationAvailable ? (
												<ContactInput
													placeholder={t('label.attendee_plural', 'Attendees')}
													onChange={callbacks.onAttendeesChange}
													defaultValue={data.resource.attendees}
													disabled={updateAppTime || proposeNewTime}
												/>
											) : (
												<ChipInput
													placeholder={t('label.attendee_plural', 'Attendees')}
													background="gray5"
													onChange={onAttendeesChange}
													defaultValue={data.resource.attendees}
													valueKey="address"
													hasError={some(data.resource.attendees || [], { error: true })}
													errorLabel=""
													disabled={updateAppTime || proposeNewTime}
												/>
											)}
										</Container>
										<Container
											width="fit"
											background="gray5"
											padding={{ right: 'medium', left: 'extrasmall' }}
											orientation="horizontal"
										>
											<Button
												label={t('label.optional_plural', 'Optionals')}
												type="ghost"
												labelColor="secondary"
												style={{ padding: 0 }}
												onClick={toggleOptionals}
											/>
										</Container>
									</Container>
								</AttendeesContainer>
							</Row>
							{showOptionals && (
								<Row width="fill" padding={{ top: 'large' }}>
									<AttendeesContainer>
										{integrationAvailable ? (
											<ContactInput
												placeholder={t('label.optional_plural', 'Optionals')}
												onChange={callbacks.onAttendeesOptionalChange}
												defaultValue={data.resource.optionalAttendees}
												disabled={updateAppTime || proposeNewTime}
											/>
										) : (
											<ChipInput
												placeholder={t('label.optional_plural', 'Optionals')}
												background="gray5"
												onChange={onOptionalsChange}
												defaultValue={data.resource.optionalAttendees}
												valueKey="address"
												hasError={some(data.resource.optionalAttendees || [], { error: true })}
												errorLabel=""
												disabled={updateAppTime || proposeNewTime}
											/>
										)}
									</AttendeesContainer>
								</Row>
							)}
							<Container
								orientation="vertical"
								height="fit"
								width="fill"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
							>
								<Row
									width="fill"
									style={{ minWidth: '40%' }}
									padding={{ top: 'large' }}
									mainAlignment="space-between"
								>
									<Container width="calc(50% - 4px)">
										<FreeBusySelector
											onDisplayStatusChange={callbacks.onDisplayStatusChange}
											data={data}
											style={{ maxWidth: '48%' }}
											disabled={updateAppTime || proposeNewTime}
										/>
									</Container>
									<Container width="calc(50% - 4px)">
										<CalendarSelector
											calendarId={data.resource.calendar.id}
											onCalendarChange={callbacks.onCalendarChange}
											style={{ maxWidth: '48%' }}
											updateAppTime={updateAppTime}
											disabled={proposeNewTime}
										/>
									</Container>
								</Row>
								<Row padding={{ top: 'large' }}>
									<Checkbox
										label={t('label.private', 'Private')}
										onChange={callbacks.onPrivateChange}
										defaultChecked={data.resource.class === 'PRI'}
										disabled={updateAppTime || proposeNewTime}
									/>
								</Row>
								<Container
									height="fit"
									padding={{ top: 'large' }}
									mainAlignment="flex-start"
									crossAlignment="flex-start"
								>
									<DatePicker
										start={data.start}
										end={data.end}
										allDay={data.allDay}
										onChange={callbacks.onDateChange}
										onAllDayChange={callbacks.onAllDayChange}
										settings={settings}
										onTimeZoneChange={callbacks.onTimeZoneChange}
										startTimeZone={data.startTimeZone}
										endTimeZone={data.endTimeZone}
										invite={invite}
										t={t}
									/>
								</Container>
								<Row
									width="fill"
									style={{ minWidth: '40%' }}
									padding={{ top: 'large' }}
									mainAlignment="space-between"
								>
									<Container width="calc(50% - 4px)">
										<ReminderSelector
											disabled={updateAppTime || proposeNewTime}
											onReminderChange={callbacks.onReminderChange}
											data={data}
										/>
									</Container>
									<Container width="calc(50% - 4px)">
										<RecurrenceSelector
											data={data}
											callbacks={callbacks}
											updateAppTime={updateAppTime}
											disabled={proposeNewTime}
											isInstance={isInstance}
										/>
									</Container>
								</Row>
								{data?.resource?.attachmentFiles && data?.resource?.attachmentFiles?.length > 0 && (
									<AttachmentsBlock
										attachments={data?.resource.attachmentFiles}
										message={{ id: data?.resource.inviteId, subject: data?.title }}
										callbacks={callbacks}
										isEditor
									/>
								)}
							</Container>
							<Container minHeight="200px" padding={{ vertical: 'large' }}>
								{composerIsAvailable && data.resource.isRichText ? (
									<EditorWrapper>
										<Composer
											value={data.resource.richText}
											onEditorChange={callbacks.onTextChange}
											minHeight={200}
										/>
									</EditorWrapper>
								) : (
									<TextArea
										placeholder={textAreaLabel}
										defaultValue={data.resource.plainText}
										onChange={(ev) => {
											// eslint-disable-next-line no-param-reassign
											ev.target.style.height = 'auto';
											// eslint-disable-next-line no-param-reassign
											ev.target.style.height = `${25 + ev.target.scrollHeight}px`;
											callbacks.onTextChange([ev.target.value, ev.target.value]);
										}}
									/>
								)}
							</Container>
						</Container>
					</>
				)}
			</Container>
		</Container>
	);
}
