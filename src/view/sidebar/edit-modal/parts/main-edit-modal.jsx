/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	ButtonOld as Button,
	Checkbox,
	Container,
	Divider,
	Icon,
	Input,
	Padding,
	Row,
	Select,
	SnackbarManagerContext,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { includes, isEmpty, map, find, isNull, omitBy } from 'lodash';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FOLDERS, useUserAccounts } from '@zextras/carbonio-shell-ui';
import ModalFooter from '../../../../commons/modal-footer';
import { ModalHeader } from '../../../../commons/modal-header';
import { folderAction } from '../../../../store/actions/calendar-actions';
import { ZIMBRA_STANDARD_COLORS } from '../../../../commons/zimbra-standard-colors';
import { GranteeInfo } from './grantee-info';
import { sendShareCalendarNotification } from '../../../../store/actions/send-share-calendar-notification';
import { EditModalContext } from '../../../../commons/edit-modal-context';
import { selectAllCalendars } from '../../../../store/selectors/calendars';

const Square = styled.div`
	width: 18px;
	height: 18px;
	position: relative;
	top: -3px;
	border: 1px solid ${({ theme }) => theme.palette.gray2.regular};
	background: ${({ color }) => color};
	border-radius: 4px;
`;
const ColorContainer = styled(Container)`
	border-bottom: 1px solid ${({ theme }) => theme.palette.gray2.regular};
`;

const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;

const LabelFactory = ({ selected, label, open, focus }) => {
	const colorName = useMemo(() => selected?.[0]?.label, [selected]);
	const squareColor = useMemo(
		() =>
			colorName === 'custom'
				? selected?.[0]?.color
				: ZIMBRA_STANDARD_COLORS[Number(selected?.[0]?.value)].color,
		[colorName, selected]
	);
	return (
		<ColorContainer
			orientation="horizontal"
			width="fill"
			crossAlignment="center"
			mainAlignment="space-between"
			borderRadius="half"
			background="gray5"
			padding={{
				all: 'small'
			}}
		>
			<Row width="100%" takeAvailableSpace mainAlignment="space-between">
				<Row
					orientation="vertical"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					padding={{ left: 'small' }}
				>
					<Text size="small" color={open || focus ? 'primary' : 'secondary'}>
						{label}
					</Text>
					<TextUpperCase>{colorName}</TextUpperCase>
				</Row>
				<Padding right="small">
					<Square color={squareColor} />
				</Padding>
			</Row>
			<Icon
				size="large"
				icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
				color={open || focus ? 'primary' : 'secondary'}
				style={{ alignSelf: 'center' }}
			/>
		</ColorContainer>
	);
};

const getStatusItems = (t) =>
	ZIMBRA_STANDARD_COLORS.map((el, index) => ({
		label: t(el.label),
		value: index.toString(),
		customComponent: (
			<Container
				width="100%"
				takeAvailableSpace
				mainAlignment="space-between"
				orientation="horizontal"
				height="fit"
			>
				<Padding left="small">
					<TextUpperCase>{t(el.label)}</TextUpperCase>
				</Padding>
				<Square color={el.color} />
			</Container>
		)
	}));

export const MainEditModal = ({ folder, totalAppointments }) => {
	const allCalendars = useSelector(selectAllCalendars);
	const [inputValue, setInputValue] = useState(folder.name || '');
	const [freeBusy, setFreeBusy] = useState(folder.freeBusy || false);
	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const checked = useMemo(() => folder.checked, [folder]);

	const { setModal, setGrant, onClose } = useContext(EditModalContext);
	const accounts = useUserAccounts();
	const createSnackbar = useContext(SnackbarManagerContext);
	const [hovered, setHovered] = useState({});

	const colors = useMemo(() => getStatusItems(t), [t]);
	const onMouseEnter = useCallback((item) => {
		// setHovered(true);
		setHovered(item);
	}, []);
	const onMouseLeave = useCallback(() => {
		setHovered({});
	}, []);
	const folderArray = useMemo(() => {
		map(allCalendars, (f) => (f.label === folder.name ? null : f.label));
	}, [allCalendars, folder]);

	const showDupWarning = useMemo(
		() => includes(folderArray, inputValue),
		[inputValue, folderArray]
	);

	const disabled = useMemo(
		() =>
			folder?.id === '10'
				? false
				: inputValue.indexOf('/') > -1 ||
				  inputValue.length === 0 ||
				  inputValue === 'Calendar' ||
				  inputValue === 'calendar' ||
				  showDupWarning,
		[inputValue, folder, showDupWarning]
	);

	const defaultColor = useMemo(
		() => find(colors, { label: folder?.color?.label }) ?? folder?.color,
		[colors, folder]
	);
	const [selectedColor, setSelectedColor] = useState(defaultColor?.value || 0);
	const defaultChecked = useMemo(() => folder?.freeBusy || false, [folder]);
	const onConfirm = useCallback(() => {
		if (inputValue) {
			dispatch(
				folderAction({
					id: folder.id,
					op: 'update',
					changes: omitBy(
						{
							parent: folder.parent ?? FOLDERS.USER_ROOT,
							name: inputValue,
							color: selectedColor,
							excludeFreeBusy: freeBusy,
							checked,
							grant: folder.acl?.grant
						},
						isNull
					)
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'success',
						hideButton: true,
						label: t('label.changes_saved', 'Changes saved'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
				onClose();
			});
			setInputValue('');
			setSelectedColor(0);
			setFreeBusy(false);
		}
	}, [
		checked,
		createSnackbar,
		dispatch,
		folder.acl?.grant,
		folder.id,
		folder.parent,
		freeBusy,
		inputValue,
		onClose,
		selectedColor,
		t
	]);

	const onShare = useCallback(() => {
		setModal('share');
	}, [setModal]);

	const onRevoke = useCallback(
		(item) => {
			setModal('revoke');
			setGrant(item);
		},
		[setGrant, setModal]
	);

	const onResend = useCallback(
		(item) => {
			dispatch(
				sendShareCalendarNotification({
					contacts: [{ email: item.d }],
					folder: folder.id,
					accounts
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'info',
						hideButton: true,
						label: t('share_invite_resent', 'Share invite resent'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		},
		[accounts, createSnackbar, dispatch, folder, t]
	);

	const onEdit = useCallback(
		(item) => {
			setModal('edit');
			setGrant(item);
		},
		[setGrant, setModal]
	);

	const title = useMemo(
		() =>
			t('label.edit_access', {
				name: folder.name,
				defaultValue: "Edit {{name}}'s access"
			}),
		[folder, t]
	);

	const placeholder = useMemo(() => t('label.type_name_here', 'Calendar name'), [t]);

	return (
		<Container padding="8px 8px 24px">
			<ModalHeader onClose={onClose} title={title} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				{folder?.id === FOLDERS.CALENDAR ? (
					<Tooltip
						label={t('cannot_edit_name', 'You cannot edit the name of a system calendar')}
						placement="top"
						maxWidth="fit"
					>
						<Input
							label={placeholder}
							backgroundColor="gray5"
							defaultValue={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							disabled
						/>
					</Tooltip>
				) : (
					<Input
						label={placeholder}
						backgroundColor="gray5"
						defaultValue={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
				)}
			</Container>
			{showDupWarning && (
				<Padding all="small">
					<Text size="small" color="error">
						{t('folder.modal.new.duplicate_warning', 'Calendar with the same name already exists')}
					</Text>
				</Padding>
			)}
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				orientation="horizontal"
				height="fit"
			>
				<Row orientation="vertical" width="50%" crossAlignment="flex-start">
					<Text size="small" color="secondary">
						Type
					</Text>
					<Text>{t('label.calendar', 'Calendar')}</Text>
				</Row>
				<Row orientation="vertical" width="50%" crossAlignment="flex-start">
					<Text size="small" color="secondary">
						Appointments
					</Text>
					<Text>{totalAppointments}</Text>
				</Row>
			</Container>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				orientation="horizontal"
				height="fit"
			>
				<Select
					label={t('label.calendar_color', 'Calendar color')}
					onChange={setSelectedColor}
					items={colors}
					selection={defaultColor}
					LabelFactory={LabelFactory}
				/>
			</Container>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				orientation="horizontal"
				height="fit"
			>
				<Checkbox
					value={freeBusy}
					defaultChecked={defaultChecked}
					onClick={toggleFreeBusy}
					label={t(
						'label.exclude_free_busy',
						'Exclude this calendar when reporting the free/busy times'
					)}
				/>
			</Container>
			{!isEmpty(folder?.acl) && !folder.owner && (
				<>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="center"
						crossAlignment="flex-start"
						orientation="horizontal"
						height="fit"
					>
						<Divider />
					</Container>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="flex"
						crossAlignment="flex-start"
						orientation="horizontal"
						height="fit"
					>
						<Text weight="bold">{t('label.sharing_of_this_folder', 'Sharing of this folder')}</Text>
					</Container>
					{map(folder?.acl?.grant, (item, index) => (
						<Container
							padding={{ top: 'small', bottom: 'small' }}
							mainAlignment="center"
							crossAlignment="flex-start"
							orientation="horizontal"
							height="fit"
							key={index}
						>
							<Container orientation="horizontal" mainAlignment="flex-end">
								<GranteeInfo grant={item} hovered={hovered} />
								<Tooltip
									label={t('edit_share_properties', 'Edit share properties')}
									placement="top"
								>
									<Button
										type="outlined"
										label={t('label.edit', 'Edit')}
										onClick={() => onEdit(item)}
										isSmall
										onMouseEnter={() => onMouseEnter(item)}
										onMouseLeave={() => onMouseLeave()}
									/>
								</Tooltip>
								<Padding horizontal="extrasmall" />
								<Tooltip label={t('revoke_access', 'Revoke access')} placement="top">
									<Button
										type="outlined"
										label={t('label.revoke', 'Revoke')}
										color="error"
										onClick={() => onRevoke(item)}
										isSmall
										onMouseEnter={() => onMouseEnter(item)}
										onMouseLeave={() => onMouseLeave()}
									/>
								</Tooltip>
								<Padding horizontal="extrasmall" />
								<Tooltip
									label={t(
										'resend_mail_notification_about_this_share',
										'Send e-mail notification about this share'
									)}
									placement="top"
									maxWidth="fit"
								>
									<Button
										type="outlined"
										label={t('label.resend', 'Resend')}
										onClick={() => onResend(item)}
										isSmall
										onMouseEnter={() => onMouseEnter(item)}
										onMouseLeave={() => onMouseLeave()}
									/>
								</Tooltip>
							</Container>
						</Container>
					))}
				</>
			)}
			<ModalFooter
				onConfirm={onConfirm}
				label={t('label.ok', 'OK')}
				secondaryAction={onShare}
				secondaryLabel={t('label.add_share', 'Add share')}
				secondaryBtnType="outlined"
				secondaryColor="primary"
				disabled={disabled}
			/>
		</Container>
	);
};
