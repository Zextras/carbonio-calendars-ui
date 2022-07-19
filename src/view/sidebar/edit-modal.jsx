/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
	Container,
	Modal,
	Input,
	Padding,
	Select,
	Text,
	Checkbox,
	ButtonOld as Button,
	Row,
	Icon,
	IconButton
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { map, includes, find } from 'lodash';
import { ZIMBRA_STANDARD_COLORS } from '../../commons/zimbra-standard-colors';
import { folderAction } from '../../store/actions/calendar-actions';

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

export const EditModal = ({
	openModal,
	setModal,
	dispatch,
	t,
	folder,
	allCalendars,
	folders,
	totalAppointments,
	toggleSnackbar
}) => {
	const [inputValue, setInputValue] = useState(allCalendars[folder].name || '');
	const [freeBusy, setFreeBusy] = useState(allCalendars[folder].freeBusy || false);

	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);

	const checked = useMemo(() => allCalendars[folder].checked, [allCalendars, folder]);
	const colors = useMemo(() => getStatusItems(t), [t]);

	const folderArray = useMemo(() => {
		map(folders, (f) => (f.label === allCalendars[folder].name ? null : f.label));
	}, [folders, allCalendars, folder]);

	const showDupWarning = useMemo(
		() => includes(folderArray, inputValue),
		[inputValue, folderArray]
	);

	const disabled = useMemo(
		() =>
			folder === '10'
				? false
				: inputValue.indexOf('/') > -1 ||
				  inputValue.length === 0 ||
				  inputValue === 'Calendar' ||
				  inputValue === 'calendar' ||
				  showDupWarning,
		[inputValue, folder, showDupWarning]
	);

	const defaultColor = useMemo(
		() => find(colors, { label: allCalendars[folder]?.color?.label }),
		[allCalendars, colors, folder]
	);
	const [selectedColor, setSelectedColor] = useState(defaultColor[0]?.value || 0);
	const defaultChecked = useMemo(
		() => allCalendars[folder]?.freeBusy || false,
		[folder, allCalendars]
	);

	const onConfirm = () => {
		if (inputValue) {
			dispatch(
				folderAction({
					id: folder,
					op: 'update',
					changes: {
						parent: allCalendars[folder].parent || '1',
						name: inputValue,
						color: selectedColor,
						excludeFreeBusy: freeBusy,
						checked
					}
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					toggleSnackbar(
						true,
						t('message.snackbar.calendar_edits_saved', 'Edits saved correctly'),
						'info'
					);
				} else {
					toggleSnackbar(
						false,
						t('message.snackbar.calendar_edits_saved', 'Something went wrong, please try again'),
						'error'
					);
				}
			});
			setInputValue('');
			setSelectedColor(0);
			setFreeBusy(false);
		}
		setModal('');
	};

	const onClose = useCallback(() => setModal(''), [setModal]);

	const title = useMemo(() => t('label.edit_access', "Edit {{name}}'s access"), [t]);
	const placeholder = useMemo(() => t('label.type_name_here', 'Calendar name'), [t]);

	function CustomTitle() {
		return (
			<Row orientation="horizontal" mainAlignment="space-between">
				<Text weight="bold" size="large">
					{title}
				</Text>
				<IconButton
					size="medium"
					style={{ padding: 0, margin: 0 }}
					onClick={onClose}
					icon="CloseOutline"
				/>
			</Row>
		);
	}
	function CustomFooter() {
		return (
			<Container orientation="horizontal" mainAlignment="flex-end">
				<Padding right="small">
					<Button label={t('action.cancel')} color="secondary" onClick={onClose} />
				</Padding>
				<Button label={t('label.save', 'Save')} disabled={disabled} onClick={onConfirm} />
			</Container>
		);
	}

	return (
		<Modal
			title={<CustomTitle />}
			open={openModal}
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			onClose={() => {}}
			maxHeight="90vh"
			customFooter={<CustomFooter />}
			disablePortal
		>
			<Container
				padding={{ all: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Input
					label={placeholder}
					backgroundColor="gray5"
					defaultValue={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					disabled={folder === '10'}
				/>
				{showDupWarning && (
					<Padding all="small">
						<Text size="small" color="error">
							{t(
								'folder.modal.new.duplicate_warning',
								'Calendar with the same name already exists'
							)}
						</Text>
					</Padding>
				)}
				<Padding vertical="medium" />
				<ColorContainer
					mainAlignment="flex-start"
					padding={{ vertical: 'small', horizontal: 'medium' }}
					crossAlignment="flex-start"
					takeAvailableSpace
					width="100%"
					orientation="horizontal"
					background="gray5"
				>
					<Row orientation="vertical" width="25%" crossAlignment="flex-start">
						<Text size="small" color="secondary">
							Type
						</Text>
						<Text>{t('label.calendar', 'Calendar')}</Text>
					</Row>
					<Row orientation="vertical" width="25%" crossAlignment="flex-start">
						<Text size="small" color="secondary">
							Appointments
						</Text>
						<Text>{`${totalAppointments(folder) || 0}`}</Text>
					</Row>
				</ColorContainer>

				<Padding vertical="medium" />

				<Select
					label={t('label.calendar_color', 'Calendar color')}
					onChange={setSelectedColor}
					items={colors}
					defaultSelection={defaultColor}
					LabelFactory={LabelFactory}
				/>
				<Padding vertical="medium" />
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
		</Modal>
	);
};
