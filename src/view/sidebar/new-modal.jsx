/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Padding,
	Select,
	Text,
	Checkbox,
	Row,
	Icon,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ZIMBRA_STANDARD_COLORS } from '../../commons/zimbra-standard-colors';
import { createCalendar } from '../../store/actions/create-calendar';
import { ModalHeader } from '../../commons/modal-header';
import ModalFooter from '../../commons/modal-footer';
import { selectAllCalendars } from '../../store/selectors/calendars';

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
const LabelFactory = ({ selected, label, open, focus }) => (
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
				<TextUpperCase>{selected[0].label}</TextUpperCase>
			</Row>
			<Padding right="small">
				<Square color={ZIMBRA_STANDARD_COLORS[Number(selected[0].value)].color} />
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
const getStatusItems = (t) =>
	ZIMBRA_STANDARD_COLORS.map((el, index) => ({
		background: el.background,
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
				<Padding right="small">
					<Square color={el.color} />
				</Padding>
			</Container>
		)
	}));

export const NewModal = ({ onClose }) => {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const [inputValue, setInputValue] = useState('');
	const [freeBusy, setFreeBusy] = useState(false);
	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);
	const colors = useMemo(() => getStatusItems(t), [t]);
	const [selectedColor, setSelectedColor] = useState(0);
	const createSnackbar = useContext(SnackbarManagerContext);

	const folders = useSelector(selectAllCalendars);

	const folderArray = useMemo(() => map(folders, (f) => f.label), [folders]);

	const showDupWarning = useMemo(
		() => includes(folderArray, inputValue),
		[inputValue, folderArray]
	);
	const disabled = useMemo(
		() =>
			inputValue.indexOf('/') > -1 ||
			inputValue.length === 0 ||
			inputValue === 'Calendar' ||
			inputValue === 'calendar' ||
			showDupWarning,
		[inputValue, showDupWarning]
	);

	const onConfirm = () => {
		if (inputValue) {
			dispatch(
				createCalendar({
					parent: '1',
					name: inputValue,
					color: selectedColor,
					excludeFreeBusy: freeBusy
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'success',
						hideButton: true,
						label: t('message.snackbar.new_calendar_created', 'New calendar created'),
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
		}
		setInputValue('');
		setSelectedColor(0);
		setFreeBusy(false);
		onClose();
	};

	const onCloseFn = useCallback(() => {
		setInputValue('');
		setSelectedColor(0);
		setFreeBusy(false);
		onClose();
	}, [onClose]);

	const title = useMemo(() => t('label.create_new_calendar', 'Create a New Calendar'), [t]);
	const placeholder = useMemo(() => t('label.type_name_here', 'Calendar name'), [t]);

	return (
		<Container padding="8px 8px 24px">
			<ModalHeader title={title} onClose={onCloseFn} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Input
					label={placeholder}
					backgroundColor="gray5"
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value);
					}}
				/>
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
				height="fit"
			>
				<Select
					label={'Select color'}
					onChange={setSelectedColor}
					items={colors}
					defaultSelection={colors[0]}
					LabelFactory={LabelFactory}
				/>
			</Container>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Checkbox
					value={freeBusy}
					onClick={toggleFreeBusy}
					label={t(
						'label.exclude_free_busy',
						'Exclude this calendar when reporting the free/busy times'
					)}
				/>
			</Container>
			<ModalFooter onConfirm={onConfirm} label={t('label.create', 'Create')} disabled={disabled} />
		</Container>
	);
};
